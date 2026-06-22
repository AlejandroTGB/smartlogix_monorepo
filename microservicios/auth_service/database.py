from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

#URL de conexion
SQLALCHEMY_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@db_auth:5432/db_auth"

#motor async - traduce instrucciones a sql sin bloquear el hilo
engine = create_async_engine(SQLALCHEMY_DATABASE_URL)

#fabrica de sesiones async
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

#Clase base para los modelos
Base = declarative_base()

#Inyector de dependencias async
async def get_db():
    async with AsyncSessionLocal() as db:
        yield db