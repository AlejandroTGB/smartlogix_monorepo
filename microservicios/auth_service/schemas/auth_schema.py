from pydantic import BaseModel, EmailStr

#============================
# Entrada
#============================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    nombre:str

#============================
# Salida
#============================

class LoginResponse(BaseModel):
    id: int
    nombre: str
    rol: str
    token: str

class RegisterResponse(BaseModel):
    id: int
    email: EmailStr
    nombre: str
    rol: str