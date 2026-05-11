import httpx
import jwt
import os
from fastapi import FastAPI, Request, HTTPException, Response
from dotenv import load_dotenv

app = FastAPI(title="SmartLogix Gateway",
              docs_url=None, redoc_url=None, openapi_url=None)

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

RUTAS_SERVICIOS = {
    "auth": "http://api_auth:8000",
    "inventario": "http://api_inventario:8000"
}

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def enrutador_principal(request: Request, path: str):
    # 1. Determinar a qué servicio va analizando el inicio de la ruta
    # Si la ruta es "api/v1/auth/login", el servicio es "auth"
    partes = path.split("/")
    
    # Buscamos si alguna parte de la URL coincide con nuestros servicios (auth o inventario)
    servicio_destino = None
    for s in RUTAS_SERVICIOS.keys():
        if s in partes:
            servicio_destino = s
            break

    if not servicio_destino:
        raise HTTPException(status_code=404, detail="No se pudo determinar el servicio de destino")

    # 2. Seguridad (Solo para Inventario y métodos de escritura)
    if servicio_destino == "inventario" and request.method in ["POST", "PUT", "DELETE"]:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Token requerido")
        try:
            token = auth_header.replace("Bearer ", "")
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("rol") != "admin":
                raise HTTPException(status_code=403, detail="Permisos insuficientes")
        except Exception as e:
            # Esto te dirá el error real en la respuesta de Postman
            raise HTTPException(status_code=401, detail=f"Error de validación: {str(e)}")

    # 3. CONSTRUCCIÓN DE URL INTELIGENTE
    # Si el usuario pide ".../docs", se lo pedimos a la raíz del microservicio
    # Si pide ".../api/v1/...", se lo pedimos completo.
    url_base = RUTAS_SERVICIOS[servicio_destino]
    
    if "docs" in partes or "openapi.json" in partes:
        # Si pide documentación, la buscamos en la raíz del microservicio
        url_final = f"{url_base}/{partes[-1]}"
    else:
        # Si es una ruta normal, la pasamos tal cual: http://api_auth:8000/api/v1/auth/login
        url_final = f"{url_base}/{path}"

    # 4. Petición interna
    async with httpx.AsyncClient() as client:
        try:
            respuesta = await client.request(
                method=request.method,
                url=url_final,
                headers=request.headers.raw,
                content=await request.body()
            )
            return Response(
                content=respuesta.content,
                status_code=respuesta.status_code,
                headers=dict(respuesta.headers)
            )
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail=f"Servicio {servicio_destino} no disponible")