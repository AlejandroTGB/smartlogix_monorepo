from typing import List

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.producto_model import ProductoDB
from schemas.producto_schema import ProductoCreate, ProductoResponse, StockUpdate

router = APIRouter(
    prefix="/api/v1/inventario",
    tags=["Inventario"]
)

#lista temporal para testear rutas de inventario
##{
        #"id": 1,
        #"nombre": "Manzana",
        #"descripcion": "Asitica y verde",
        #"precio": 990,
        #"stock": 26
    #},
    #{
        #"id": 2,
        #"nombre": "Monitor Thunderobot",
        #"descripcion": "Monitor QHD de 27p",
        #"precio": 125990,
        #"stock": 8
    #}
#]


#listar productos
@router.get("/productos", response_model=List[ProductoResponse])
async def listar_productos(db: Session = Depends(get_db)):
    return db.query(ProductoDB).all()


#buscar producto id
@router.get("/productos/{producto_id}", response_model=ProductoResponse)
async def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(ProductoDB).filter(ProductoDB.id == producto_id).first()
    if not producto:
         raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


#crear producto
@router.post("/productos", response_model=ProductoResponse, status_code=201)
async def crear_producto(datos: ProductoCreate, db: Session = Depends(get_db)):
    nuevo_producto = ProductoDB(
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        precio=datos.precio,
        stock=datos.stock
    )
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto


#actualizar stock
@router.put("/productos/{producto_id}/stock", response_model=ProductoResponse)
async def actualizar_stock(producto_id: int, datos: StockUpdate, db: Session = Depends(get_db)):
    producto = db.query(ProductoDB).filter(ProductoDB.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    producto.stock = datos.stock
    db.commit()
    db.refresh(producto)
    return producto


#eliminar producto
@router.delete("/productos/{producto_id}")
async def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(ProductoDB).filter(ProductoDB.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()
    return {"mensaje": "Producto eliminado correctamente"}
