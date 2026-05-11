from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

# La URL apunta al contenedor 'db_inventario' que crearemos en docker-compose
#SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@db_inventario:5432/db_inventario"
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/db_inventario"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependencia para los routers
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()