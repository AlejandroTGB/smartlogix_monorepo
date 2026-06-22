from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference
from routers.envios_router import router as rutas_envios
from database import engine, Base
import models.envio_model

app = FastAPI(
    title="SmartLogix - Servicio de Envios",
    description="Microservicio para gestion de envios y seguimiento",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
)

@app.on_event("startup")
async def crear_tablas():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(rutas_envios)

@app.get("/docs", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title="SmartLogix API - Scalar Docs Servicio Envios"
    )

@app.get("/", tags=["Sistema"])
async def health_check():
    return {"status": "Envios Service funcionando correctamente con Scalar"}