from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from schemas.auth_schema import LoginRequest, LoginResponse, RegisterRequest, UsuarioResponse
from services.auth_service import AuthService
from database import get_db

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticacion"]
)


#============================
# Ruta de registro
#============================
@router.post("/registro", response_model=UsuarioResponse, status_code=201)
async def registrar(
    datos: RegisterRequest,
    db: Session = Depends(get_db) #----> la inyeccion
):  
    #Pasamos datos y la conexión al service
    nuevo_usuario = AuthService.registrar_usuario(db,datos)
    
    #Si el service devueve none es que ya estaba registrado ese corrreo
    if not nuevo_usuario:
        raise HTTPException(status_code=400, detail="El correo ya está registrado en el sistema.")
    
    #si sale bien, devolvemos el usuario
    return nuevo_usuario

#============================
# Ruta de login
#============================
@router.post("/login", response_model=LoginResponse)
async def login(
    credenciales: LoginRequest,
    db: Session = Depends(get_db)
):
    #pasamos conexion y datos al service
    usuario_autenticado = AuthService.autenticar_usuario(db, credenciales)

    if not usuario_autenticado:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    return usuario_autenticado