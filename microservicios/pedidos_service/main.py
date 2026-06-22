from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference
from routers.pedidos_router import router as rutas_pedidos
from database import engine, Base
import models.pedido_model
import models.idempotency_model
import rabbitmq

app = FastAPI(
    title="SmartLogix - Servicio de Pedidos",
    description="Microservicio para gestion de pedidos",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
)


@app.on_event("startup")
async def startup():
    # 1. Crear tablas
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # 2. Conectar a RabbitMQ
    await rabbitmq.connect()
    # 3. Arrancar consumer en background (no bloquea el startup)
    import asyncio
    asyncio.create_task(rabbitmq.start_consumer())


@app.on_event("shutdown")
async def shutdown():
    await rabbitmq.disconnect()


app.include_router(rutas_pedidos)


@app.get("/docs", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title="SmartLogix API - Scalar Docs Servicio Pedidos"
    )


@app.get("/", tags=["Sistema"])
async def health_check():
    return {"status": "Pedidos Service funcionando correctamente con Scalar"}