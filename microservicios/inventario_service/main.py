from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference
from routers.inventario_router import router as rutas_inventario
from database import engine
from models.producto_model import Base

#crea las tablas solo si es que no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartLogix - Servicio de Inventario",
    description="Microservicio para gestion de productos y stock",
    version="1.0.0",
    docs_url=None,
    redoc_url=None #apagamos docs y redoc porque usaremos scalar
)

#rutas
app.include_router(rutas_inventario)

#ruta scalar
@app.get("/docs", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title="SmartLogix API - Scalar Docs Servicio Inventario"
    )

@app.get("/", tags=["Sistema"])
async def health_check():
    return {"status": "Inventario Service funcionando correctamente con Scalar"}
