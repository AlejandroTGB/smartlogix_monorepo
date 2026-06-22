from typing import Dict, Iterable

from fastapi import HTTPException

from models.pedido_model import DetallePedidoDB


estados_permitidos = ["pendiente", "preparando", "enviado", "entregado", "cancelado"]


def agrupar_cantidades_por_producto(productos: Iterable) -> Dict[int, int]:
    cantidades_por_producto = {}

    for producto in productos:
        cantidad_actual = cantidades_por_producto.get(producto.producto_id, 0)
        cantidades_por_producto[producto.producto_id] = cantidad_actual + producto.cantidad

    return cantidades_por_producto


def crear_detalles_pedido(productos: Iterable):
    return [
        DetallePedidoDB(
            producto_id=producto.producto_id,
            cantidad=producto.cantidad
        )
        for producto in productos
    ]


def validar_estado_pedido(estado: str):
    if estado not in estados_permitidos:
        raise HTTPException(status_code=400, detail="Estado de pedido no permitido")
