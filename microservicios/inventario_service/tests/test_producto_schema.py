import sys
from pathlib import Path

import pytest
from pydantic import ValidationError

SERVICE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_DIR))

for module_name in list(sys.modules):
    if module_name == "database" or module_name.startswith(("models", "schemas", "services")):
        del sys.modules[module_name]

from schemas.producto_schema import ProductoCreate, StockDescuento, StockUpdate


def test_producto_create_acepta_datos_validos():
    producto = ProductoCreate(
        nombre="Notebook",
        descripcion="Equipo para oficina",
        precio=799990,
        stock=5,
    )

    assert producto.nombre == "Notebook"
    assert producto.precio == 799990
    assert producto.stock == 5


def test_producto_create_rechaza_precio_cero():
    with pytest.raises(ValidationError):
        ProductoCreate(nombre="Mouse", precio=0, stock=5)


def test_stock_update_rechaza_stock_negativo():
    with pytest.raises(ValidationError):
        StockUpdate(stock=-1)


def test_stock_descuento_rechaza_cantidad_cero():
    with pytest.raises(ValidationError):
        StockDescuento(cantidad=0)
