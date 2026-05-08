from sqlalchemy import Column, Integer, String
#Importamos la db que creamos en el archivo de conexion database.py
from database import Base

class UsuarioDB(Base):
    #Nombre de la tabla
    __tablename__ = "usuarios"

    #Columnas
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    nombre = Column(String, nullable=False)
    rol = Column(String, default="user")