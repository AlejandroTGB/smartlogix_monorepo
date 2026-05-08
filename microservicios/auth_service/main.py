from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference
from fastapi.responses import HTMLResponse
from routers.auth_router import router as rutas_autenticacion

app = FastAPI(
    title="SmartLogix - Servicio de Autenticación",
    description="Microservicio de autenticación",
    version="1.0.0",
    docs_url=None,
    redoc_url=None #apague docs y redoc porque usaremos scalar jeje
)

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