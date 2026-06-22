import sys
from pathlib import Path

import pytest
from fastapi import HTTPException

SERVICE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_DIR))

if "main" in sys.modules:
    del sys.modules["main"]

from main import enrutador_principal


class FakeHeaders(dict):
    def get(self, key, default=None):
        return super().get(key.lower(), default)


class FakeRequest:
    def __init__(self, method="GET", headers=None, body=b""):
        self.method = method
        self.headers = FakeHeaders(headers or {})
        self._body = body

    async def body(self):
        return self._body


@pytest.mark.asyncio
async def test_gateway_rechaza_ruta_sin_servicio_destino():
    request = FakeRequest(method="GET")

    with pytest.raises(HTTPException) as exc:
        await enrutador_principal(request, "api/v1/desconocido")

    assert exc.value.status_code == 404
    assert exc.value.detail == "No se pudo determinar el servicio de destino"


@pytest.mark.asyncio
async def test_gateway_exige_token_para_ruta_protegida():
    request = FakeRequest(method="POST")

    with pytest.raises(HTTPException) as exc:
        await enrutador_principal(request, "api/v1/inventario/productos")

    assert exc.value.status_code == 401
    assert exc.value.detail == "Token requerido"
