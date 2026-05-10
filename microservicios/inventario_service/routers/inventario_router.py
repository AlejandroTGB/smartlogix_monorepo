from typing import List

from fastapi import APIRouter, HTTPException
from schemas.producto_schema import ProductoCreate, ProductoResponse, StockUpdate

router = APIRouter(
    prefix="/api/v1/inventario",
    tags=["Inventario"]
)

#lista temporal para testear rutas de inventario
productos = [
    {
        "id": 1,
        "nombre": "Manzana",
        "descripcion": "Asitica y verde",
        "precio": 990,
        "stock": 26
    },
    {
        "id": 2,
        "nombre": "Monitor Thunderobot",
        "descripcion": "Monitor QHD de 27p",
        "precio": 125990,
        "stock": 8
    }
]


#listar productos
@router.get("/productos", response_model=List[ProductoResponse])
async def listar_productos():
    return productos


#buscar producto id
@router.get("/productos/{producto_id}", response_model=ProductoResponse)
async def obtener_producto(producto_id: int):
    for producto in productos:
        if producto["id"] == producto_id:
            return producto

    raise HTTPException(status_code=404, detail="Producto no encontrado")


#crear producto
@router.post("/productos", response_model=ProductoResponse, status_code=201)
async def crear_producto(datos: ProductoCreate):
    nuevo_id = productos[-1]["id"] + 1 if productos else 1

    nuevo_producto = {
        "id": nuevo_id,
        "nombre": datos.nombre,
        "descripcion": datos.descripcion,
        "precio": datos.precio,
        "stock": datos.stock
    }

    productos.append(nuevo_producto)

    return nuevo_producto


#actualizar stock
@router.put("/productos/{producto_id}/stock", response_model=ProductoResponse)
async def actualizar_stock(producto_id: int, datos: StockUpdate):
    for producto in productos:
        if producto["id"] == producto_id:
            producto["stock"] = datos.stock
            return producto

    raise HTTPException(status_code=404, detail="Producto no encontrado")
