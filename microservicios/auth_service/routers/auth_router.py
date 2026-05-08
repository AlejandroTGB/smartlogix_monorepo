from fastapi import APIRouter, HTTPException
from schemas.auth_schema import LoginRequest, LoginResponse

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticacion"]
)

@router.post("/login", response_model=LoginResponse)
async def login(credenciales: LoginRequest):
    if credenciales.email == "admin@smartlogix.cl" and credenciales.password == "123":
        return {
            "id": 1,
            "nombre": "Admin",
            "rol": "admin",
            "token":"test-jwt-valido"
        }
    else:
        raise HTTPException(status_code=401, detail= "Credenciales incorrectas")
