from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference
from routers.auth_router import router as rutas_autenticacion
from database import engine, Base
import models.user_model


app = FastAPI(
    title="SmartLogix - Servicio de Autenticación",
    description="Microservicio de autenticación",
    version="1.0.0",
    docs_url=None,
    redoc_url=None #apague docs y redoc porque usaremos scalar jeje
)

#crear tablas al arrancar la app
@app.on_event("startup")
async def crear_tablas():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
#rutas
app.include_router(rutas_autenticacion)

#ruta scalar
@app.get("/docs", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title="SmartLogix API - Scalar Docs Servicio Autenticación"
    )

@app.get("/", tags=["Sistema"])
async def health_check():
    return {"status": "Auth Service funcionando correctamente con Scalar"}