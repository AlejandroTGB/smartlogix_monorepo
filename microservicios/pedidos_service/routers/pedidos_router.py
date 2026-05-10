from typing import List

from fastapi import APIRouter, HTTPException
from schemas.pedido_schema import EstadoPedidoUpdate, PedidoCreate, PedidoResponse

router = APIRouter(
    prefix="/api/v1/pedidos",
    tags=["Pedidos"]
)

#lista temporal para testear pedidos
pedidos = [
    {
        "id": 1,
        "cliente_id": 1,
        "productos": [
            {
                "producto_id": 1,
                "cantidad": 2
            }
        ],
        "estado": "pendiente"
    },
    {
        "id": 2,
        "cliente_id": 2,
        "productos": [
            {
                "producto_id": 2,
                "cantidad": 1
            }
        ],
        "estado": "entregado"
    }
]

estados_permitidos = ["pendiente", "preparando", "enviado", "entregado", "cancelado"]


# Listar pedidos
@router.get("", response_model=List[PedidoResponse])
async def listar_pedidos():
    return pedidos


# Buscar pedido por id
@router.get("/{pedido_id}", response_model=PedidoResponse)
async def obtener_pedido(pedido_id: int):
    for pedido in pedidos:
        if pedido["id"] == pedido_id:
            return pedido

    raise HTTPException(status_code=404, detail="Pedido no encontrado")


# Crear pedido
@router.post("", response_model=PedidoResponse, status_code=201)
async def crear_pedido(datos: PedidoCreate):
    nuevo_id = pedidos[-1]["id"] + 1 if pedidos else 1

    nuevo_pedido = {
        "id": nuevo_id,
        "cliente_id": datos.cliente_id,
        "productos": [producto.model_dump() for producto in datos.productos],
        "estado": "pendiente"
    }

    pedidos.append(nuevo_pedido)

    return nuevo_pedido


# Actualizar estado
@router.put("/{pedido_id}/estado", response_model=PedidoResponse)
async def actualizar_estado(pedido_id: int, datos: EstadoPedidoUpdate):
    if datos.estado not in estados_permitidos:
        raise HTTPException(status_code=400, detail="Estado de pedido no permitido")

    for pedido in pedidos:
        if pedido["id"] == pedido_id:
            pedido["estado"] = datos.estado
            return pedido

    raise HTTPException(status_code=404, detail="Pedido no encontrado")
