from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base

class PedidoDB(Base):
    #Nombre de la tabla
    __tablename__ = "pedidos"

    #Columnas
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, index=True, nullable=False)
    estado = Column(String, default="pendiente", nullable=False)

    #un pedido puede tener muchos productos asociados en el detalle
    productos = relationship(
        "DetallePedidoDB",
        back_populates="pedido",
        cascade="all, delete-orphan"
    )

class DetallePedidoDB(Base):
    #Nombre de la tabla
    __tablename__ = "detalle_pedidos"

    #Columnas
    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    producto_id = Column(Integer, nullable=False)
    cantidad = Column(Integer, nullable=False)

    #Relacion con la tabla pedidos
    pedido = relationship("PedidoDB", back_populates="productos")
