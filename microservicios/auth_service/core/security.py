import os
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt.exceptions import PyJWTError

#esto busca el .env y lo carga en la memoria temporal de python
load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "clave_por_defecto_insegura")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 60))

#crear token
def crear_token_acceso(datos: dict):
    to_encode = datos.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

#verifica token

esquema_seguridad = HTTPBearer()

def verificar_token(credenciales: HTTPAuthorizationCredentials = Security(esquema_seguridad)):
    #sacamos el texto del token
    token = credenciales.credentials

    try:
        #intentomas decodificar el token con la llave secreta
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        #si sale bien devolvemos datos del usuario
        return payload
    
    except PyJWTError:
        #si el token expiro, la firma no coincide o es texto basura tiramos error
        raise HTTPException(status_code=401, detail="Token de acceso inválido o expirado. Acceso denegado.",
                            headers={"WWW-Authenticate": "Bearer"},
                            )