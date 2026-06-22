import sys
from pathlib import Path

import bcrypt
import pytest

SERVICE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_DIR))

for module_name in list(sys.modules):
    if module_name == "database" or module_name.startswith(("models", "schemas", "services", "core")):
        del sys.modules[module_name]

from models.user_model import UsuarioDB
from schemas.auth_schema import LoginRequest, RegisterRequest
from services.auth_service import AuthService


class FakeQuery:
    def __init__(self, result):
        self.result = result

    def scalar_one_or_none(self):
        return self.result


class FakeDB:
    def __init__(self, query_result=None):
        self.query_result = query_result
        self.added = None
        self.committed = False
        self.refreshed = None

    async def execute(self, _query):
        return FakeQuery(self.query_result)

    def add(self, item):
        self.added = item

    async def commit(self):
        self.committed = True

    async def refresh(self, item):
        self.refreshed = item
        item.id = 1
        item.rol = item.rol or "user"


def crear_usuario(password_plana="secreto", rol="admin"):
    password_hash = bcrypt.hashpw(
        password_plana.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")
    usuario = UsuarioDB(
        id=7,
        email="admin@smartlogix.cl",
        password=password_hash,
        nombre="Admin",
        rol=rol,
    )
    return usuario


@pytest.mark.asyncio
async def test_registrar_usuario_guarda_password_hasheada():
    db = FakeDB(query_result=None)
    datos = RegisterRequest(
        email="nuevo@smartlogix.cl",
        password="clave123",
        nombre="Usuario Nuevo",
    )

    usuario = await AuthService.registrar_usuario(db, datos)

    assert db.committed is True
    assert db.added.email == "nuevo@smartlogix.cl"
    assert db.added.password != "clave123"
    assert bcrypt.checkpw("clave123".encode("utf-8"), db.added.password.encode("utf-8"))
    assert usuario is db.added


@pytest.mark.asyncio
async def test_registrar_usuario_rechaza_correo_existente():
    db = FakeDB(query_result=crear_usuario())
    datos = RegisterRequest(
        email="admin@smartlogix.cl",
        password="clave123",
        nombre="Admin",
    )

    usuario = await AuthService.registrar_usuario(db, datos)

    assert usuario is None
    assert db.added is None
    assert db.committed is False


@pytest.mark.asyncio
async def test_autenticar_usuario_devuelve_token_con_credenciales_validas():
    usuario_db = crear_usuario(password_plana="secreto", rol="admin")
    db = FakeDB(query_result=usuario_db)
    credenciales = LoginRequest(email="admin@smartlogix.cl", password="secreto")

    respuesta = await AuthService.autenticar_usuario(db, credenciales)

    assert respuesta["id"] == 7
    assert respuesta["nombre"] == "Admin"
    assert respuesta["rol"] == "admin"
    assert isinstance(respuesta["token"], str)
    assert len(respuesta["token"]) > 20


@pytest.mark.asyncio
async def test_autenticar_usuario_rechaza_password_incorrecta():
    usuario_db = crear_usuario(password_plana="secreto")
    db = FakeDB(query_result=usuario_db)
    credenciales = LoginRequest(email="admin@smartlogix.cl", password="mala")

    respuesta = await AuthService.autenticar_usuario(db, credenciales)

    assert respuesta is None
