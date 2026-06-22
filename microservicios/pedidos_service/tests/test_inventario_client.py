import sys
from pathlib import Path

import httpx
import pytest
from fastapi import HTTPException

SERVICE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_DIR))

for module_name in list(sys.modules):
    if module_name == "database" or module_name.startswith(("models", "schemas", "services")):
        del sys.modules[module_name]

from services import inventario_client


class FakeResponse:
    def __init__(self, status_code, body=None):
        self.status_code = status_code
        self._body = body or {}

    def json(self):
        return self._body


class FakeAsyncClient:
    get_responses = []
    put_responses = []
    get_urls = []
    put_calls = []
    raise_on_get = False
    raise_on_put = False

    def __init__(self, timeout=None):
        self.timeout = timeout

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def get(self, url):
        self.__class__.get_urls.append(url)
        if self.__class__.raise_on_get:
            raise httpx.RequestError("sin conexion")
        return self.__class__.get_responses.pop(0)

    async def put(self, url, json):
        self.__class__.put_calls.append((url, json))
        if self.__class__.raise_on_put:
            raise httpx.RequestError("sin conexion")
        return self.__class__.put_responses.pop(0)


@pytest.fixture(autouse=True)
def reset_fake_client(monkeypatch):
    FakeAsyncClient.get_responses = []
    FakeAsyncClient.put_responses = []
    FakeAsyncClient.get_urls = []
    FakeAsyncClient.put_calls = []
    FakeAsyncClient.raise_on_get = False
    FakeAsyncClient.raise_on_put = False
    monkeypatch.setattr(inventario_client.httpx, "AsyncClient", FakeAsyncClient)


@pytest.mark.asyncio
async def test_validar_productos_en_inventario_acepta_stock_suficiente():
    FakeAsyncClient.get_responses = [
        FakeResponse(200, {"id": 1, "stock": 8}),
        FakeResponse(200, {"id": 2, "stock": 3}),
    ]

    await inventario_client.validar_productos_en_inventario({1: 5, 2: 1})

    assert len(FakeAsyncClient.get_urls) == 2
    assert FakeAsyncClient.get_urls[0].endswith("/api/v1/inventario/productos/1")


@pytest.mark.asyncio
async def test_validar_productos_en_inventario_rechaza_stock_insuficiente():
    FakeAsyncClient.get_responses = [FakeResponse(200, {"id": 1, "stock": 2})]

    with pytest.raises(HTTPException) as exc:
        await inventario_client.validar_productos_en_inventario({1: 5})

    assert exc.value.status_code == 400
    assert "Stock insuficiente" in exc.value.detail


@pytest.mark.asyncio
async def test_validar_productos_en_inventario_informa_servicio_no_disponible():
    FakeAsyncClient.raise_on_get = True

    with pytest.raises(HTTPException) as exc:
        await inventario_client.validar_productos_en_inventario({1: 1})

    assert exc.value.status_code == 503
    assert exc.value.detail == "Inventario no disponible"


@pytest.mark.asyncio
async def test_descontar_stock_en_inventario_envia_cantidad_correcta():
    FakeAsyncClient.put_responses = [FakeResponse(200, {"id": 1, "stock": 4})]

    await inventario_client.descontar_stock_en_inventario({1: 2})

    url, body = FakeAsyncClient.put_calls[0]
    assert url.endswith("/api/v1/inventario/productos/1/descontar-stock")
    assert body == {"cantidad": 2}


@pytest.mark.asyncio
async def test_descontar_stock_en_inventario_rechaza_error_de_stock():
    FakeAsyncClient.put_responses = [FakeResponse(400)]

    with pytest.raises(HTTPException) as exc:
        await inventario_client.descontar_stock_en_inventario({1: 10})

    assert exc.value.status_code == 400
    assert "Stock insuficiente" in exc.value.detail
