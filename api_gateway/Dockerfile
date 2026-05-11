# Usamos una imagen de Python ligera
FROM python:3.11-slim

# Definimos la carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero el archivo de requerimientos
COPY requirements.txt .

# Instalamos FastAPI, Uvicorn y HTTPX
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código (el main.py)
COPY . .

# Exponemos el puerto 8080, que será la puerta de entrada principal
EXPOSE 8080

# Levantamos el servidor en el puerto 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]