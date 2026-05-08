from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

#url conexión (generico local octualmente)
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/db_auth"

#motor (traductor)
#envia las instrucciones SQL a la db
engine = create_engine(SQLALCHEMY_DATABASE_URL)

#fabrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#Clase base para los modelos
Base = declarative_base()