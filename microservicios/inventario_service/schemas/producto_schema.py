from typing import Optional

from pydantic import BaseModel, Field


# Entrada
class ProductoCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = None
    precio: float = Field(gt=0)
    stock: int = Field(ge=0)

class ProductoUpdate(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = None
    precio: float = Field(gt=0)
    stock: int = Field(ge=0)

class StockUpdate(BaseModel):
    stock: int = Field(ge=0)

class StockDescuento(BaseModel):
    cantidad: int = Field(gt=0)


# Salida
class ProductoResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    stock: int
