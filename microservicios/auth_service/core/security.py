import os
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

#esto busca el .env y lo carga en la memoria temporal de python
load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "clave_por_defecto_insegura")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 60))

def crear_token_acceso(datos: dict):
    to_encode = datos.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

