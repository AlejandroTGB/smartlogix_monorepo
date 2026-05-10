# SmartLogix - Auth Service

Este microservicio es el componente central de seguridad de la plataforma SmartLogix. Se encarga de la gestión de identidades, el registro de usuarios con hashing de credenciales y la emisión de tokens de acceso bajo el estándar JWT.

## Arquitectura y Patrones de Diseño

El servicio ha sido diseñado siguiendo principios de arquitectura limpia y patrones de diseño específicos para garantizar la escalabilidad y el desacoplamiento:

### 1. Arquitectura de Microservicios

Consiste en diseñar la aplicación como un conjunto de servicios pequeños e independientes.

- **Aplicación:** Este servicio posee su propia base de datos (PostgreSQL) y su propio ciclo de vida de despliegue, permitiendo que la lógica de autenticación sea independiente de otros módulos como Inventario o Pedidos.

### 2. Arquitectura en Capas (Layered Architecture)

Consiste en organizar el código en niveles de responsabilidad, donde cada capa solo puede comunicarse con la inmediata inferior.

- **Aplicación:**
  - **Routers:** Manejan el protocolo HTTP.
  - **Services:** Contienen la lógica de negocio.
  - **Models:** Definen la estructura de persistencia.

### 3. Patrón DTO (Data Transfer Object)

Este patrón consiste en utilizar objetos simples para el transporte de datos entre procesos, evitando exponer las entidades internas de la base de datos directamente al cliente.

- **Aplicación:** Se implementa mediante Schemas de Pydantic. Por ejemplo, al registrar un usuario, el cliente envía un DTO de petición, y el servidor responde con un DTO que excluye campos sensibles como el hash de la contraseña.

### 4. Patrón Fachada / Service Pattern

Consiste en proporcionar una interfaz unificada y simplificada a un conjunto de interfaces en un subsistema más complejo.

- **Aplicación:** El archivo `auth_service.py` actúa como fachada. El Router no necesita conocer cómo se encripta una clave con Bcrypt o cómo se genera un JWT; simplemente invoca los métodos del servicio, ocultando la complejidad técnica.

### 5. Inyección de Dependencias (Dependency Injection)

Consiste en una técnica donde un objeto recibe sus dependencias de una fuente externa en lugar de crearlas internamente.

- **Aplicación:** Se utiliza el sistema `Depends()` de FastAPI para inyectar la sesión de la base de datos (`get_db`) y el validador de seguridad (`verificar_token`) en los endpoints, facilitando el testing y la gestión de recursos.

### 6. Patrón Repository y Unit of Work

El patrón Repository consiste en mediar entre las capas de lógica de negocio y de datos, actuando como una colección de objetos en memoria.

- **Aplicación:** En este proyecto, SQLAlchemy implementa el patrón _Unit of Work_ a través del objeto `Session`. Aunque no se creó una clase Repository explícita para evitar sobreingeniería, las consultas en la capa de Service utilizan la sesión inyectada para realizar operaciones atómicas sobre la entidad `UsuarioDB`.

## Infraestructura y Dockerización

El servicio está completamente contenedorizado, lo que asegura la paridad entre los entornos de desarrollo y producción.

### Dockerfile

El archivo de configuración de imagen define un entorno basado en Python 3.11-slim. El proceso de construcción (build) instala las dependencias de sistema para el driver de PostgreSQL (`psycopg2`) y empaqueta el código fuente, exponiendo el puerto 8000.

### Orquestación con Docker Compose

Se utiliza Docker Compose para levantar el ecosistema completo:

- **Red Interna:** Los contenedores se comunican mediante nombres de servicio (`db_auth`) en lugar de direcciones IP locales, permitiendo que la API localice la base de datos de forma dinámica.
- **Volúmenes:** Se utilizan volúmenes para que los datos de PostgreSQL persistan incluso si el contenedor es destruido.

## Guía de Ejecución

### Requisitos Previos

- Docker y Docker Compose instalados.
- Cuenta en Docker Hub (para despliegue).

### Ejecución Local con Docker Compose

Desde la raíz del proyecto SmartLogix, ejecute el siguiente comando para levantar la base de datos y la API simultáneamente:

```bash
docker-compose up -d --build
```

La documentación interactiva de la API estará disponible en: http://localhost:8000/docs.

## Despliegue en Docker Hub

Para subir nuevas versiones del microservicio al registro remoto, siga el flujo de versionamiento:

1. Construir la imagen con una nueva etiqueta:

```bash
docker build -t tu_usuario/smartlogix-auth:v2 .
```

2. Cargar la imagen al registro:

```bash
docker push tu_usuario/smartlogix-auth:v2
```

## Variables de Entorno

El servicio requiere un archivo `.env` en su raíz con las siguientes definiciones:

- `JWT_SECRET_KEY`: Llave maestra para la firma de tokens.
- `JWT_ALGORITHM`: Algoritmo de encriptación (ej. HS256).
- `JWT_EXPIRE_MINUTES`: Tiempo de vida del token de acceso.
