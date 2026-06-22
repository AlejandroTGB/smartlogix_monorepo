import json
import uuid
import os
import asyncio
import aio_pika
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database import AsyncSessionLocal
from models.pedido_model import PedidoDB
from models.idempotency_model import IdempotencyKeyDB

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://rabbitmq:5672")
EXCHANGE_NAME = "smartlogix_events"

_connection = None
_channel = None
_exchange = None


async def connect():
    global _connection, _channel, _exchange
    _connection = await aio_pika.connect_robust(RABBITMQ_URL)
    _channel = await _connection.channel()
    await _channel.set_qos(prefetch_count=1)
    _exchange = await _channel.declare_exchange(
        EXCHANGE_NAME,
        aio_pika.ExchangeType.DIRECT,
        durable=True
    )


async def disconnect():
    if _connection:
        await _connection.close()


async def publish_stock_check(pedido_id: int, productos: list, idempotency_key: str):
    """Publicar evento StockCheckRequested a Inventario."""
    payload = {
        "event": "stock.check.requested",
        "pedido_id": pedido_id,
        "productos": productos,
        "idempotency_key": idempotency_key
    }
    message = aio_pika.Message(
        body=json.dumps(payload).encode(),
        delivery_mode=aio_pika.DeliveryMode.PERSISTENT
    )
    await _exchange.publish(message, routing_key="stock.check.requested")


async def publish_pedido_confirmado(pedido_id: int, cliente_id: int,
                                     direccion_entrega: str, comuna: str, ciudad: str):
    """Publicar evento PedidoConfirmado a Envios."""
    payload = {
        "event": "pedido.confirmado",
        "pedido_id": pedido_id,
        "cliente_id": cliente_id,
        "direccion_entrega": direccion_entrega,
        "comuna": comuna,
        "ciudad": ciudad
    }
    message = aio_pika.Message(
        body=json.dumps(payload).encode(),
        delivery_mode=aio_pika.DeliveryMode.PERSISTENT
    )
    await _exchange.publish(message, routing_key="pedido.confirmado")


async def publish_pedido_estado_actualizado(pedido_id: int, estado: str):
    """Publicar evento para sincronizar el estado del envio asociado."""
    payload = {
        "event": "pedido.estado_actualizado",
        "pedido_id": pedido_id,
        "estado": estado,
        "idempotency_key": str(uuid.uuid4())
    }
    message = aio_pika.Message(
        body=json.dumps(payload).encode(),
        delivery_mode=aio_pika.DeliveryMode.PERSISTENT
    )
    await _exchange.publish(message, routing_key="pedido.estado_actualizado")


async def start_consumer():
    """Consumir respuestas de Inventario y actualizaciones de Envios."""
    queue = await _channel.declare_queue("pedidos.stock_response", durable=True)
    await queue.bind(_exchange, routing_key="stock.confirmed")
    await queue.bind(_exchange, routing_key="stock.failed")
    await queue.bind(_exchange, routing_key="envio.estado_actualizado")

    async with queue.iterator() as queue_iter:
        async for message in queue_iter:
            async with message.process():
                data = json.loads(message.body.decode())
                if data["event"] == "envio.estado_actualizado":
                    await handle_envio_estado_actualizado(data)
                else:
                    await handle_stock_response(data)


async def handle_stock_response(data: dict):
    """Actualizar estado del pedido según respuesta de Inventario."""
    idempotency_key = data["idempotency_key"]
    pedido_id = data["pedido_id"]

    async with AsyncSessionLocal() as db:
        # Verificar idempotencia
        existing = await db.execute(
            select(IdempotencyKeyDB).where(IdempotencyKeyDB.key == idempotency_key)
        )
        if existing.scalar_one_or_none():
            return

        # Cargar pedido
        resultado = await db.execute(
            select(PedidoDB).where(PedidoDB.id == pedido_id)
        )
        pedido = resultado.scalar_one_or_none()
        if not pedido:
            return

        if data["event"] == "stock.confirmed":
            pedido.estado = "confirmado"
            db.add(IdempotencyKeyDB(key=idempotency_key))
            await db.commit()
            # Publicar PedidoConfirmado para que Envios cree el envío
            await publish_pedido_confirmado(
                pedido.id, pedido.cliente_id,
                pedido.direccion_entrega, pedido.comuna, pedido.ciudad
            )
        elif data["event"] == "stock.failed":
            pedido.estado = "cancelado"
            db.add(IdempotencyKeyDB(key=idempotency_key))
            await db.commit()


def mapear_estado_envio_a_pedido(estado_envio: str) -> str:
    """Traducir estados de envio al estado visible del pedido."""
    estados = {
        "pendiente": "confirmado",
        "preparando": "preparando",
        "despachado": "enviado",
        "en_transito": "enviado",
        "entregado": "entregado",
        "cancelado": "cancelado"
    }
    return estados[estado_envio]


async def handle_envio_estado_actualizado(data: dict):
    """Actualizar el pedido cuando cambia el estado del envio asociado."""
    idempotency_key = data["idempotency_key"]
    pedido_id = data["pedido_id"]
    nuevo_estado = mapear_estado_envio_a_pedido(data["estado"])

    async with AsyncSessionLocal() as db:
        existing = await db.execute(
            select(IdempotencyKeyDB).where(IdempotencyKeyDB.key == idempotency_key)
        )
        if existing.scalar_one_or_none():
            return

        resultado = await db.execute(
            select(PedidoDB).where(PedidoDB.id == pedido_id)
        )
        pedido = resultado.scalar_one_or_none()
        if not pedido:
            return

        pedido.estado = nuevo_estado
        db.add(IdempotencyKeyDB(key=idempotency_key))
        await db.commit()
