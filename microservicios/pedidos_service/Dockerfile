#img python
FROM python:3.11-slim
#directorio
WORKDIR /app
#dependencias sistema psycopg2 (db)
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*
#librerias python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
#copiar codigo del microservicio
COPY . .
#exponer puerto fastapi
EXPOSE 8000
#comando para ejecutar el microservicio
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
