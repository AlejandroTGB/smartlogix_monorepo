from typing import List

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.pedido_model import DetallePedidoDB, PedidoDB
from schemas.pedido_schema import EstadoPedidoUpdate, PedidoCreate, PedidoResponse
from services.inventario_client import descontar_stock_en_inventario, validar_productos_en_inventario

router = APIRouter(
    prefix="/api/v1/pedidos",
    tags=["Pedidos"]
)

estados_permitidos = ["pendiente", "preparando", "enviado", "entregado", "cancelado"]


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
    cantidades_por_producto = {}

    for producto in datos.productos:
        cantidad_actual = cantidades_por_producto.get(producto.producto_id, 0)
        cantidades_por_producto[producto.producto_id] = cantidad_actual + producto.cantidad

    await validar_productos_en_inventario(cantidades_por_producto)

    nuevo_pedido = PedidoDB(
        cliente_id=datos.cliente_id,
        estado="pendiente"
    )

    for producto in datos.productos:
        nuevo_pedido.productos.append(
            DetallePedidoDB(
                producto_id=producto.producto_id,
                cantidad=producto.cantidad
            )
        )

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
    if datos.estado not in estados_permitidos:
        raise HTTPException(status_code=400, detail="Estado de pedido no permitido")

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
