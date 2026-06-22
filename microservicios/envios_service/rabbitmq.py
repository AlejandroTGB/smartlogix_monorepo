import json
import os
import aio_pika
from sqlalchemy import select
from database import AsyncSessionLocal
from models.envio_model import EnvioDB

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


async def start_consumer():
    """Consumir eventos PedidoConfirmado y crear envío automático."""
    queue = await _channel.declare_queue("envios.pedido_confirmado", durable=True)
    await queue.bind(_exchange, routing_key="pedido.confirmado")

    async with queue.iterator() as queue_iter:
        async for message in queue_iter:
            async with message.process():
                data = json.loads(message.body.decode())
                await handle_pedido_confirmado(data)


async def handle_pedido_confirmado(data: dict):
    """Crear envío automáticamente cuando un pedido se confirma."""
    pedido_id = data["pedido_id"]

    async with AsyncSessionLocal() as db:
        # IDEMPOTENCIA: verificar si ya existe envío para este pedido
        existing = await db.execute(
            select(EnvioDB).where(EnvioDB.pedido_id == pedido_id)
        )
        if existing.scalar_one_or_none():
            return  # ya existe envío para este pedido, ignorar

        # Crear envío
        nuevo_envio = EnvioDB(
            pedido_id=pedido_id,
            direccion_entrega=data["direccion_entrega"],
            comuna=data["comuna"],
            ciudad=data["ciudad"],
            codigo_seguimiento="ENV-temporal",
            estado="pendiente"
        )
        db.add(nuevo_envio)
        await db.flush()
        nuevo_envio.codigo_seguimiento = f"ENV-{nuevo_envio.id:05d}"
        await db.commit()