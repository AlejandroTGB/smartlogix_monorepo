from typing import List

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.envio_model import EnvioDB
from schemas.envio_schema import EnvioCreate, EnvioResponse, EstadoEnvioUpdate

router = APIRouter(
    prefix="/api/v1/envios",
    tags=["Envios"]
)

estados_permitidos = ["pendiente", "preparando", "despachado", "en_transito", "entregado", "cancelado"]


# Listar envios
@router.get("", response_model=List[EnvioResponse])
async def listar_envios(db: Session = Depends(get_db)):
    return db.query(EnvioDB).all()


# Buscar envio por id
@router.get("/{envio_id}", response_model=EnvioResponse)
async def obtener_envio(envio_id: int, db: Session = Depends(get_db)):
    envio = db.query(EnvioDB).filter(EnvioDB.id == envio_id).first()
    if not envio:
        raise HTTPException(status_code=404, detail="Envio no encontrado")
    return envio


# Crear envio
@router.post("", response_model=EnvioResponse, status_code=201)
async def crear_envio(datos: EnvioCreate, db: Session = Depends(get_db)):
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
    db.flush()
    nuevo_envio.codigo_seguimiento = f"ENV-{nuevo_envio.id:05d}"
    db.commit()
    db.refresh(nuevo_envio)
    return nuevo_envio


# Actualizar estado
@router.put("/{envio_id}/estado", response_model=EnvioResponse)
async def actualizar_estado(envio_id: int, datos: EstadoEnvioUpdate, db: Session = Depends(get_db)):
    if datos.estado not in estados_permitidos:
        raise HTTPException(status_code=400, detail="Estado de envio no permitido")

    envio = db.query(EnvioDB).filter(EnvioDB.id == envio_id).first()
    if not envio:
        raise HTTPException(status_code=404, detail="Envio no encontrado")
    envio.estado = datos.estado
    db.commit()
    db.refresh(envio)
    return envio


# Eliminar envio
@router.delete("/{envio_id}")
async def eliminar_envio(envio_id: int, db: Session = Depends(get_db)):
    envio = db.query(EnvioDB).filter(EnvioDB.id == envio_id).first()
    if not envio:
        raise HTTPException(status_code=404, detail="Envio no encontrado")
    db.delete(envio)
    db.commit()
    return {"mensaje": "Envio eliminado correctamente"}
