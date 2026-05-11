import os
from typing import Dict

import httpx
from fastapi import HTTPException

INVENTARIO_SERVICE_URL = os.getenv(
    "INVENTARIO_SERVICE_URL",
    "http://localhost:8001"
)


#cliente para consultar inventario sin acceder directo a su db
async def validar_productos_en_inventario(cantidades_por_producto: Dict[int, int]):
    async with httpx.AsyncClient(timeout=5.0) as client:
        for producto_id, cantidad in cantidades_por_producto.items():
            url = f"{INVENTARIO_SERVICE_URL}/api/v1/inventario/productos/{producto_id}"

            try:
                respuesta = await client.get(url)
            except httpx.RequestError:
                raise HTTPException(status_code=503, detail="Inventario no disponible")

            if respuesta.status_code == 404:
                raise HTTPException(
                    status_code=400,
                    detail=f"Producto {producto_id} no existe en inventario"
                )

            if respuesta.status_code != 200:
                raise HTTPException(
                    status_code=502,
                    detail="Error consultando inventario"
                )

            producto = respuesta.json()

            if producto["stock"] < cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para producto {producto_id}"
                )
