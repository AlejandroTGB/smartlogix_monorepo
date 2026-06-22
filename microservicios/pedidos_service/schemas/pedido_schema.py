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
    direccion_entrega: str = Field(min_length=5, max_length=150)
    comuna: str = Field(min_length=2, max_length=80)
    ciudad: str = Field(min_length=2, max_length=80)

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
    direccion_entrega: str
    comuna: str
    ciudad: str