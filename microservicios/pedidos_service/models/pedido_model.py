from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base

class PedidoDB(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, index=True, nullable=False)
    estado = Column(String, default="pendiente_stock", nullable=False)
    direccion_entrega = Column(String, nullable=False)
    comuna = Column(String, nullable=False)
    ciudad = Column(String, nullable=False)

    productos = relationship(
        "DetallePedidoDB",
        back_populates="pedido",
        cascade="all, delete-orphan"
    )

class DetallePedidoDB(Base):
    __tablename__ = "detalle_pedidos"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    producto_id = Column(Integer, nullable=False)
    cantidad = Column(Integer, nullable=False)

    pedido = relationship("PedidoDB", back_populates="productos")