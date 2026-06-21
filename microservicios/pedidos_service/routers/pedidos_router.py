from typing import List

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.pedido_model import PedidoDB
from schemas.pedido_schema import EstadoPedidoUpdate, PedidoCreate, PedidoResponse
from services.inventario_client import descontar_stock_en_inventario, validar_productos_en_inventario
from services.pedido_service import (
    agrupar_cantidades_por_producto,
    crear_detalles_pedido,
    estados_permitidos,
    validar_estado_pedido,
)

router = APIRouter(
    prefix="/api/v1/pedidos",
    tags=["Pedidos"]
)

# Listar pedidos
@router.get("", response_model=List[PedidoResponse])
async def listar_pedidos(db: Session = Depends(get_db)):
    return db.query(PedidoDB).all()


# Buscar pedido por id
@router.get("/{pedido_id}", response_model=PedidoResponse)
async def obtener_pedido(pedido_id: int, db: Session = Depends(get_db)):
    pedido = db.query(PedidoDB).filter(PedidoDB.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido


# Crear pedido
@router.post("", response_model=PedidoResponse, status_code=201)
async def crear_pedido(datos: PedidoCreate, db: Session = Depends(get_db)):
    cantidades_por_producto = agrupar_cantidades_por_producto(datos.productos)

    await validar_productos_en_inventario(cantidades_por_producto)

    nuevo_pedido = PedidoDB(
        cliente_id=datos.cliente_id,
        estado="pendiente"
    )

    nuevo_pedido.productos.extend(crear_detalles_pedido(datos.productos))

    db.add(nuevo_pedido)

    try:
        await descontar_stock_en_inventario(cantidades_por_producto)
        db.commit()
    except HTTPException:
        db.rollback()
        raise

    db.refresh(nuevo_pedido)
    return nuevo_pedido


# Actualizar estado
@router.put("/{pedido_id}/estado", response_model=PedidoResponse)
async def actualizar_estado(pedido_id: int, datos: EstadoPedidoUpdate, db: Session = Depends(get_db)):
    validar_estado_pedido(datos.estado)

    pedido = db.query(PedidoDB).filter(PedidoDB.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    pedido.estado = datos.estado
    db.commit()
    db.refresh(pedido)
    return pedido


# Eliminar pedido
@router.delete("/{pedido_id}")
async def eliminar_pedido(pedido_id: int, db: Session = Depends(get_db)):
    pedido = db.query(PedidoDB).filter(PedidoDB.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    db.delete(pedido)
    db.commit()
    return {"mensaje": "Pedido eliminado correctamente"}
