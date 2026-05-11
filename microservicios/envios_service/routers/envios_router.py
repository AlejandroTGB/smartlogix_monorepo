from typing import List

from fastapi import APIRouter, HTTPException
from schemas.envio_schema import EnvioCreate, EnvioResponse, EstadoEnvioUpdate

router = APIRouter(
    prefix="/api/v1/envios",
    tags=["Envios"]
)

#lista temporal para testear las rutas de envios
envios = [
    {
        "id": 1,
        "pedido_id": 1,
        "direccion_entrega": "Vivaldi 742",
        "comuna": "Quilicura",
        "ciudad": "Santiago",
        "transportista": "Chilexpress",
        "codigo_seguimiento": "ENV-00001",
        "estado": "pendiente"
    },
    {
        "id": 2,
        "pedido_id": 2,
        "direccion_entrega": "Romario 123",
        "comuna": "Providencia",
        "ciudad": "Santiago",
        "transportista": "Starken",
        "codigo_seguimiento": "ENV-00002",
        "estado": "en_transito"
    }
]

estados_permitidos = ["pendiente", "preparando", "despachado", "en_transito", "entregado", "cancelado"]


# Listar envios
@router.get("", response_model=List[EnvioResponse])
async def listar_envios():
    return envios


# Buscar envio por id
@router.get("/{envio_id}", response_model=EnvioResponse)
async def obtener_envio(envio_id: int):
    for envio in envios:
        if envio["id"] == envio_id:
            return envio

    raise HTTPException(status_code=404, detail="Envio no encontrado")


# Crear envio
@router.post("", response_model=EnvioResponse, status_code=201)
async def crear_envio(datos: EnvioCreate):
    nuevo_id = envios[-1]["id"] + 1 if envios else 1

    nuevo_envio = {
        "id": nuevo_id,
        "pedido_id": datos.pedido_id,
        "direccion_entrega": datos.direccion_entrega,
        "comuna": datos.comuna,
        "ciudad": datos.ciudad,
        "transportista": datos.transportista,
        "codigo_seguimiento": f"ENV-{nuevo_id:05d}",
        "estado": "pendiente"
    }

    envios.append(nuevo_envio)

    return nuevo_envio


# Actualizar estado
@router.put("/{envio_id}/estado", response_model=EnvioResponse)
async def actualizar_estado(envio_id: int, datos: EstadoEnvioUpdate):
    if datos.estado not in estados_permitidos:
        raise HTTPException(status_code=400, detail="Estado de envio no permitido")

    for envio in envios:
        if envio["id"] == envio_id:
            envio["estado"] = datos.estado
            return envio

    raise HTTPException(status_code=404, detail="Envio no encontrado")
