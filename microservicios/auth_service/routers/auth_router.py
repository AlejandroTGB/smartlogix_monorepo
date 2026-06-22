from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.auth_schema import LoginRequest, LoginResponse, RegisterRequest, UsuarioResponse
from services.auth_service import AuthService
from database import get_db
from core.security import verificar_token

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticacion"]
)

@router.post("/registro", response_model=UsuarioResponse, status_code=201)
async def registrar(
    datos: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):  
    nuevo_usuario = await AuthService.registrar_usuario(db, datos)
    
    if not nuevo_usuario:
        raise HTTPException(status_code=400, detail="El correo ya está registrado en el sistema.")
    
    return nuevo_usuario

@router.post("/login", response_model=LoginResponse)
async def login(
    credenciales: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    usuario_autenticado = await AuthService.autenticar_usuario(db, credenciales)

    if not usuario_autenticado:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    return usuario_autenticado

@router.get("/perfil")
async def ver_perfil(usuario_token: dict = Depends(verificar_token)):
    return {
        "mensaje": "Acceso autorizado. Aquí podrías mostrar información del perfil del usuario.",
        "datos_secretos": "Info sensible",
        "tu_identidad": usuario_token
    }