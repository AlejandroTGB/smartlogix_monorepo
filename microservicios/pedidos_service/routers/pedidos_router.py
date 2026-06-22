import uuid
from typing import List

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database import get_db
from models.pedido_model import DetallePedidoDB, PedidoDB
from schemas.pedido_schema import EstadoPedidoUpdate, PedidoCreate, PedidoResponse
from rabbitmq import publish_pedido_estado_actualizado, publish_stock_check

router = APIRouter(
    prefix="/api/v1/pedidos",
    tags=["Pedidos"]
)

estados_permitidos = ["pendiente_stock", "confirmado", "preparando", "enviado", "entregado", "cancelado"]


# Listar pedidos
@router.get("", response_model=List[PedidoResponse])
async def listar_pedidos(db: AsyncSession = Depends(get_db)):
    resultado = await db.execute(select(PedidoDB).options(selectinload(PedidoDB.productos)))
    return resultado.scalars().all()


# Buscar pedido por id
@router.get("/{pedido_id}", response_model=PedidoResponse)
async def obtener_pedido(pedido_id: int, db: AsyncSession = Depends(get_db)):
    resultado = await db.execute(
        select(PedidoDB).options(selectinload(PedidoDB.productos)).where(PedidoDB.id == pedido_id)
    )
    pedido = resultado.scalar_one_or_none()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido


# Crear pedido
@router.post("", response_model=PedidoResponse, status_code=201)
async def crear_pedido(datos: PedidoCreate, db: AsyncSession = Depends(get_db)):
    # 1. Crear el pedido en estado PENDIENTE_STOCK
    nuevo_pedido = PedidoDB(
        cliente_id=datos.cliente_id,
        estado="pendiente_stock",
        direccion_entrega=datos.direccion_entrega,
        comuna=datos.comuna,
        ciudad=datos.ciudad
    )

    for producto in datos.productos:
        nuevo_pedido.productos.append(
            DetallePedidoDB(
                producto_id=producto.producto_id,
                cantidad=producto.cantidad
            )
        )

    db.add(nuevo_pedido)
    await db.commit()
    await db.refresh(nuevo_pedido, attribute_names=["productos"])

    # 2. Publicar evento a RabbitMQ (NO esperamos respuesta)
    productos_para_validar = [
        {"producto_id": p.producto_id, "cantidad": p.cantidad}
        for p in datos.productos
    ]
    idempotency_key = str(uuid.uuid4())
    await publish_stock_check(nuevo_pedido.id, productos_para_validar, idempotency_key)

    # 3. Devolver el pedido al cliente (todavía PENDIENTE_STOCK)
    return nuevo_pedido


# Actualizar estado
@router.put("/{pedido_id}/estado", response_model=PedidoResponse)
async def actualizar_estado(pedido_id: int, datos: EstadoPedidoUpdate, db: AsyncSession = Depends(get_db)):
    if datos.estado not in estados_permitidos:
        raise HTTPException(status_code=400, detail="Estado de pedido no permitido")

    resultado = await db.execute(
        select(PedidoDB).options(selectinload(PedidoDB.productos)).where(PedidoDB.id == pedido_id)
    )
    pedido = resultado.scalar_one_or_none()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    pedido.estado = datos.estado
    await db.commit()
    await db.refresh(pedido, attribute_names=["productos"])
    await publish_pedido_estado_actualizado(pedido.id, pedido.estado)
    return pedido


# Eliminar pedido
@router.delete("/{pedido_id}")
async def eliminar_pedido(pedido_id: int, db: AsyncSession = Depends(get_db)):
    resultado = await db.execute(select(PedidoDB).where(PedidoDB.id == pedido_id))
    pedido = resultado.scalar_one_or_none()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    await db.delete(pedido)
    await db.commit()
    return {"mensaje": "Pedido eliminado correctamente"}
