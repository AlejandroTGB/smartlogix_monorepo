import json
import uuid
import os
import aio_pika
from sqlalchemy import select
from database import AsyncSessionLocal
from models.producto_model import ProductoDB
from models.idempotency_model import IdempotencyKeyDB

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://rabbitmq:5672")
EXCHANGE_NAME = "smartlogix_events"

# Globales de conexión (se inicializan en startup)
_connection = None
_channel = None
_exchange = None


async def connect():
    """Conectar a RabbitMQ y declarar exchange."""
    global _connection, _channel, _exchange
    _connection = await aio_pika.connect_robust(RABBITMQ_URL)
    _channel = await _connection.channel()
    # prefetch_count=1: solo procesar 1 mensaje a la vez (importante para idempotencia)
    await _channel.set_qos(prefetch_count=1)
    _exchange = await _channel.declare_exchange(
        EXCHANGE_NAME,
        aio_pika.ExchangeType.DIRECT,
        durable=True
    )


async def disconnect():
    """Cerrar conexión al apagar."""
    if _connection:
        await _connection.close()


async def publish_stock_response(pedido_id: int, success: bool, motivo: str = None):
    """Publicar respuesta de validación de stock a Pedidos."""
    event = "stock.confirmed" if success else "stock.failed"
    routing_key = event
    payload = {
        "event": event,
        "pedido_id": pedido_id,
        "idempotency_key": str(uuid.uuid4())
    }
    if not success:
        payload["motivo"] = motivo

    message = aio_pika.Message(
        body=json.dumps(payload).encode(),
        delivery_mode=aio_pika.DeliveryMode.PERSISTENT
    )
    await _exchange.publish(message, routing_key=routing_key)


async def start_consumer():
    """Consumir mensajes de StockCheckRequested."""
    queue = await _channel.declare_queue("inventario.stock_check", durable=True)
    await queue.bind(_exchange, routing_key="stock.check.requested")

    async with queue.iterator() as queue_iter:
        async for message in queue_iter:
            # async with message.process(): auto-ack al salir bien, auto-nack si hay excepción
            async with message.process():
                data = json.loads(message.body.decode())
                await handle_stock_check(data)


async def handle_stock_check(data: dict):
    """Validar stock, descontar y publicar respuesta."""
    idempotency_key = data["idempotency_key"]
    pedido_id = data["pedido_id"]
    productos = data["productos"]

    async with AsyncSessionLocal() as db:
        # 1. VERIFICAR IDEMPOTENCIA
        existing = await db.execute(
            select(IdempotencyKeyDB).where(IdempotencyKeyDB.key == idempotency_key)
        )
        if existing.scalar_one_or_none():
            # Ya procesamos este mensaje, ignorar
            return

        # 2. VALIDAR STOCK DE TODOS LOS PRODUCTOS
        for item in productos:
            resultado = await db.execute(
                select(ProductoDB).where(ProductoDB.id == item["producto_id"])
            )
            producto = resultado.scalar_one_or_none()
            if not producto:
                await publish_stock_response(pedido_id, False, f"Producto {item['producto_id']} no existe")
                return
            if producto.stock < item["cantidad"]:
                await publish_stock_response(pedido_id, False, f"Stock insuficiente para producto {item['producto_id']}")
                return

        # 3. DESCONTAR STOCK (todos validaron OK)
        for item in productos:
            resultado = await db.execute(
                select(ProductoDB).where(ProductoDB.id == item["producto_id"])
            )
            producto = resultado.scalar_one_or_none()
            producto.stock -= item["cantidad"]

        # 4. GUARDAR IDEMPOTENCY KEY (en la misma transacción que el descuento)
        db.add(IdempotencyKeyDB(key=idempotency_key))
        await db.commit()

        # 5. PUBLICAR RESPUESTA
        await publish_stock_response(pedido_id, True)