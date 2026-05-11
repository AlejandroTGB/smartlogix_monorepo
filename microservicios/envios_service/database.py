from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

#url conexion
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@db_envios:5432/db_envios"

#motor (traductor)
#envia las instrucciones SQL a la db
engine = create_engine(SQLALCHEMY_DATABASE_URL)

#fabrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#Clase base para los modelos
Base = declarative_base()

#inyector de dependencias
def get_db():
    db = SessionLocal() #abre la conexion
    try:
        yield db        #entrega la conexion al router para que la use
    finally:
        db.close()      #cierra la conexion cuando el router termine su pega
