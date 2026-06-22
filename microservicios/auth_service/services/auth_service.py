import bcrypt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.user_model import UsuarioDB
from schemas.auth_schema import LoginRequest, RegisterRequest
from core.security import crear_token_acceso

class AuthService:
    @staticmethod
    async def registrar_usuario(db: AsyncSession, datos: RegisterRequest):
        # verificar si el correo ya existe
        resultado = await db.execute(select(UsuarioDB).where(UsuarioDB.email == datos.email))
        usuario_existente = resultado.scalar_one_or_none()
        
        if usuario_existente:
            return None
        
        # encriptar la contraseña
        salt = bcrypt.gensalt()
        password_encriptada = bcrypt.hashpw(datos.password.encode('utf-8'), salt).decode('utf-8')

        # crear el registro nuevo
        nuevo_usuario = UsuarioDB(
            email=datos.email,
            password=password_encriptada,
            nombre=datos.nombre
        )

        # guardar en la db
        db.add(nuevo_usuario)
        await db.commit()
        await db.refresh(nuevo_usuario)

        return nuevo_usuario
    
    @staticmethod
    async def autenticar_usuario(db: AsyncSession, credenciales: LoginRequest):
        # buscar al usuario por correo
        resultado = await db.execute(select(UsuarioDB).where(UsuarioDB.email == credenciales.email))
        usuario_db = resultado.scalar_one_or_none()
        
        if not usuario_db:
            return None
        
        # verificar la password
        clave_ingresada_bytes = credenciales.password.encode('utf-8')
        clave_guardada_bytes = usuario_db.password.encode('utf-8')

        if not bcrypt.checkpw(clave_ingresada_bytes, clave_guardada_bytes):
            return None
        
        # armar el token JWT
        datos_token = {
            "sub": usuario_db.email,
            "id": usuario_db.id,
            "rol": usuario_db.rol
        }
        token_acceso = crear_token_acceso(datos_token)

        return {
            "id": usuario_db.id,
            "nombre": usuario_db.nombre,
            "rol": usuario_db.rol,
            "token": token_acceso
        }