from typing import List

from pydantic import BaseModel, Field

#============================
# Entrada
#============================

class PedidoItemCreate(BaseModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(gt=0)

class PedidoCreate(BaseModel):
    cliente_id: int = Field(gt=0)
    productos: List[PedidoItemCreate]

class EstadoPedidoUpdate(BaseModel):
    estado: str

#============================
# Salida
#============================

class PedidoItemResponse(BaseModel):
    producto_id: int
    cantidad: int

class PedidoResponse(BaseModel):
    id: int
    cliente_id: int
    productos: List[PedidoItemResponse]
    estado: str
