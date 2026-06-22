import sys
from pathlib import Path

import pytest
from pydantic import ValidationError

SERVICE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_DIR))

for module_name in list(sys.modules):
    if module_name == "database" or module_name.startswith(("models", "schemas", "services")):
        del sys.modules[module_name]

from schemas.envio_schema import EnvioCreate, EstadoEnvioUpdate


def test_envio_create_acepta_datos_validos():
    envio = EnvioCreate(
        pedido_id=1,
        direccion_entrega="Av. Siempre Viva 742",
        comuna="Santiago",
        ciudad="Santiago",
        transportista="Chilexpress",
    )

    assert envio.pedido_id == 1
    assert envio.transportista == "Chilexpress"


def test_envio_create_rechaza_pedido_id_invalido():
    with pytest.raises(ValidationError):
        EnvioCreate(
            pedido_id=0,
            direccion_entrega="Av. Siempre Viva 742",
            comuna="Santiago",
            ciudad="Santiago",
        )


def test_envio_create_rechaza_direccion_muy_corta():
    with pytest.raises(ValidationError):
        EnvioCreate(
            pedido_id=1,
            direccion_entrega="A",
            comuna="Santiago",
            ciudad="Santiago",
        )


def test_estado_envio_update_guarda_estado_enviado():
    estado = EstadoEnvioUpdate(estado="en_transito")

    assert estado.estado == "en_transito"
