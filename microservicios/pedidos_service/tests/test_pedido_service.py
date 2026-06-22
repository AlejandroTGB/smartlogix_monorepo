import sys
from pathlib import Path

import pytest
from fastapi import HTTPException

SERVICE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_DIR))

for module_name in list(sys.modules):
    if module_name == "database" or module_name.startswith(("models", "schemas", "services")):
        del sys.modules[module_name]

from schemas.pedido_schema import PedidoItemCreate
from services.pedido_service import (
    agrupar_cantidades_por_producto,
    crear_detalles_pedido,
    validar_estado_pedido,
)


def test_agrupar_cantidades_suma_productos_repetidos():
    productos = [
        PedidoItemCreate(producto_id=1, cantidad=2),
        PedidoItemCreate(producto_id=2, cantidad=1),
        PedidoItemCreate(producto_id=1, cantidad=3),
    ]

    resultado = agrupar_cantidades_por_producto(productos)

    assert resultado == {1: 5, 2: 1}


def test_crear_detalles_pedido_mapea_items_a_modelos():
    productos = [
        PedidoItemCreate(producto_id=10, cantidad=4),
        PedidoItemCreate(producto_id=20, cantidad=1),
    ]

    detalles = crear_detalles_pedido(productos)

    assert len(detalles) == 2
    assert detalles[0].producto_id == 10
    assert detalles[0].cantidad == 4
    assert detalles[1].producto_id == 20
    assert detalles[1].cantidad == 1


def test_validar_estado_pedido_acepta_estado_permitido():
    validar_estado_pedido("enviado")


def test_validar_estado_pedido_rechaza_estado_no_permitido():
    with pytest.raises(HTTPException) as exc:
        validar_estado_pedido("pagado")

    assert exc.value.status_code == 400
    assert exc.value.detail == "Estado de pedido no permitido"
