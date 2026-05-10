from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

#url conexión
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@db_auth:5432/db_auth"

#motor (traductor)
#envia las instrucciones SQL a la db
engine = create_engine(SQLALCHEMY_DATABASE_URL)

#fabrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#Clase base para los modelos
Base = declarative_base()

#inyector de dependenciass
def get_db():
    db = SessionLocal() #abre la conexión
    try:
        yield db        #entrega la conexión al router para que la use
    finally:
        db.close()      #cierra la conexión cuando el router termine su pega