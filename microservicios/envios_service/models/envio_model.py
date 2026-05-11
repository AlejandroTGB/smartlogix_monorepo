from sqlalchemy import Column, Integer, String

from database import Base

class EnvioDB(Base):
    #Nombre de la tabla
    __tablename__ = "envios"

    #Columnas
    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, index=True, nullable=False)
    direccion_entrega = Column(String, nullable=False)
    comuna = Column(String, nullable=False)
    ciudad = Column(String, nullable=False)
    transportista = Column(String, nullable=True)
    codigo_seguimiento = Column(String, unique=True, index=True, nullable=False)
    estado = Column(String, default="pendiente", nullable=False)
