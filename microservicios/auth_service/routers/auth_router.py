from fastapi import APIRouter, HTTPException
from schemas.auth_schema import LoginRequest, LoginResponse
from services.auth_service import AuthService

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticacion"]
)

@router.post("/login", response_model=LoginResponse)
async def login(credenciales: LoginRequest):
    #datos al service
    usuario_autenticado = AuthService.autenticar_usuario(credenciales)

    #router decide que responder segun respuesta del service
    if not usuario_autenticado:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    #si sale bien, devolvemos el paquete
    return usuario_autenticado
