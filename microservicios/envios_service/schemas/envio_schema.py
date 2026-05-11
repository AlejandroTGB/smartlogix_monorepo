from typing import Optional

from pydantic import BaseModel, Field

#============================
# Entrada
#============================

class EnvioCreate(BaseModel):
    pedido_id: int = Field(gt=0)
    direccion_entrega: str = Field(min_length=5, max_length=150)
    comuna: str = Field(min_length=2, max_length=80)
    ciudad: str = Field(min_length=2, max_length=80)
    transportista: Optional[str] = None

class EstadoEnvioUpdate(BaseModel):
    estado: str

#============================
# Salida
#============================

class EnvioResponse(BaseModel):
    id: int
    pedido_id: int
    direccion_entrega: str
    comuna: str
    ciudad: str
    transportista: Optional[str]
    codigo_seguimiento: str
    estado: str
