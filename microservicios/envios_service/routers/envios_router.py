from typing import List

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.envio_model import EnvioDB
from rabbitmq import publish_envio_estado_actualizado
from schemas.envio_schema import EnvioCreate, EnvioResponse, EstadoEnvioUpdate, EnvioUpdate


router = APIRouter(
    prefix="/api/v1/envios",
    tags=["Envios"]
)

estados_permitidos = ["pendiente", "preparando", "despachado", "en_transito", "entregado", "cancelado"]


# Listar envios
@router.get("", response_model=List[EnvioResponse])
async def listar_envios(db: AsyncSession = Depends(get_db)):
    resultado = await db.execute(select(EnvioDB))
    return resultado.scalars().all()


# Buscar envio por id
@router.get("/{envio_id}", response_model=EnvioResponse)
async def obtener_envio(envio_id: int, db: AsyncSession = Depends(get_db)):
    resultado = await db.execute(select(EnvioDB).where(EnvioDB.id == envio_id))
    envio = resultado.scalar_one_or_none()
    if not envio:
        raise HTTPException(status_code=404, detail="Envio no encontrado")
    return envio


# Crear envio
@router.post("", response_model=EnvioResponse, status_code=201)
async def crear_envio(datos: EnvioCreate, db: AsyncSession = Depends(get_db)):
    nuevo_envio = EnvioDB(
        pedido_id=datos.pedido_id,
        direccion_entrega=datos.direccion_entrega,
        comuna=datos.comuna,
        ciudad=datos.ciudad,
        transportista=datos.transportista,
        codigo_seguimiento="ENV-temporal",
        estado="pendiente"
    )

    db.add(nuevo_envio)
    await db.flush()
    nuevo_envio.codigo_seguimiento = f"ENV-{nuevo_envio.id:05d}"
    await db.commit()
    await db.refresh(nuevo_envio)
    return nuevo_envio


# Actualizar estado
@router.put("/{envio_id}/estado", response_model=EnvioResponse)
async def actualizar_estado(envio_id: int, datos: EstadoEnvioUpdate, db: AsyncSession = Depends(get_db)):
    if datos.estado not in estados_permitidos:
        raise HTTPException(status_code=400, detail="Estado de envio no permitido")

    resultado = await db.execute(select(EnvioDB).where(EnvioDB.id == envio_id))
    envio = resultado.scalar_one_or_none()
    if not envio:
        raise HTTPException(status_code=404, detail="Envio no encontrado")
    envio.estado = datos.estado
    await db.commit()
    await db.refresh(envio)
    await publish_envio_estado_actualizado(envio.id, envio.pedido_id, envio.estado)
    return envio

# Actualizar envio completo
@router.put("/{envio_id}", response_model=EnvioResponse)
async def actualizar_envio(envio_id: int, datos: EnvioUpdate, db: AsyncSession = Depends(get_db)):
    resultado = await db.execute(select(EnvioDB).where(EnvioDB.id == envio_id))
    envio = resultado.scalar_one_or_none()
    if not envio:
        raise HTTPException(status_code=404, detail="Envio no encontrado")
    envio.direccion_entrega = datos.direccion_entrega
    envio.comuna = datos.comuna
    envio.ciudad = datos.ciudad
    envio.transportista = datos.transportista
    await db.commit()
    await db.refresh(envio)
    return envio

# Eliminar envio
@router.delete("/{envio_id}")
async def eliminar_envio(envio_id: int, db: AsyncSession = Depends(get_db)):
    resultado = await db.execute(select(EnvioDB).where(EnvioDB.id == envio_id))
    envio = resultado.scalar_one_or_none()
    if not envio:
        raise HTTPException(status_code=404, detail="Envio no encontrado")
    await db.delete(envio)
    await db.commit()
    return {"mensaje": "Envio eliminado correctamente"}
