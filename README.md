# SmartLogix

Plataforma de gestion logistica construida con una arquitectura de microservicios sobre FastAPI (Python), con base de datos independiente por servicio, un API Gateway centralizado, y un frontend SPA en React + TypeScript.

---

## Tabla de Contenidos

- [SmartLogix](#smartlogix)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Vision General](#vision-general)
  - [Arquitectura](#arquitectura)
  - [Stack Tecnologico](#stack-tecnologico)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Microservicios](#microservicios)
    - [Auth Service](#auth-service)
    - [Inventario Service](#inventario-service)
    - [Pedidos Service](#pedidos-service)
    - [Envios Service](#envios-service)
  - [API Gateway](#api-gateway)
    - [1. Enrutamiento](#1-enrutamiento)
    - [2. Autenticacion JWT](#2-autenticacion-jwt)
  - [Frontend](#frontend)
    - [Estructura de rutas](#estructura-de-rutas)
    - [Estado global (Zustand)](#estado-global-zustand)
    - [Capa API (`src/api/`)](#capa-api-srcapi)
    - [Validacion de formularios](#validacion-de-formularios)
    - [Diseno visual](#diseno-visual)
    - [Componentes clave](#componentes-clave)
  - [Patrones de Arquitectura y Diseno](#patrones-de-arquitectura-y-diseno)
    - [Arquitectura de Microservicios](#arquitectura-de-microservicios)
    - [Arquitectura en Capas (Layered Architecture)](#arquitectura-en-capas-layered-architecture)
    - [DTO (Data Transfer Object)](#dto-data-transfer-object)
    - [Service Pattern (Facade)](#service-pattern-facade)
    - [Dependency Injection](#dependency-injection)
    - [Unit of Work](#unit-of-work)
    - [Patron Observer (Frontend)](#patron-observer-frontend)
    - [Interceptor Pattern (Frontend)](#interceptor-pattern-frontend)
  - [Comunicacion Entre Servicios](#comunicacion-entre-servicios)
  - [Flujo de Autenticacion](#flujo-de-autenticacion)
  - [Base de Datos por Servicio](#base-de-datos-por-servicio)
  - [Orquestacion con Docker Compose](#orquestacion-con-docker-compose)
  - [Documentacion de API](#documentacion-de-api)
  - [Guia de Inicio Rapido](#guia-de-inicio-rapido)
    - [Requisitos previos](#requisitos-previos)
    - [Levantar el proyecto completo](#levantar-el-proyecto-completo)
    - [Desarrollo local sin Docker](#desarrollo-local-sin-docker)
  - [Variables de Entorno](#variables-de-entorno)
    - [Auth Service (`microservicios/auth_service/.env`)](#auth-service-microserviciosauth_serviceenv)
    - [API Gateway](#api-gateway-1)
    - [Pedidos Service](#pedidos-service-1)
    - [Frontend](#frontend-1)
  - [Notas de Diseño](#notas-de-diseño)

---

## Vision General

SmartLogix es una aplicacion web de gestion logistica que permite administrar inventario, pedidos y envios de forma integrada. El sistema sigue el principio de **Database per Service**: cada microservicio posee su propia instancia de PostgreSQL, garantizando desacoplamiento de datos y despliegue independiente.

El frontend consume un unico punto de entrada -- el **API Gateway** (puerto 8080) -- que enruta las peticiones al microservicio correspondiente, aplicando autenticacion JWT para operaciones de escritura en los servicios protegidos.

---

## Arquitectura

```
                              FRONTEND (React + Vite)
                                    :5173
                                      |
                                      v
                              API GATEWAY (FastAPI)
                                    :8080
                     JWT auth middleware (POST/PUT/DELETE)
                                      |
          +---------------+-----------+-----------+---------------+
          |               |           |           |               |
          v               v           v           v               v
    AUTH SERVICE    INVENTARIO   PEDIDOS    ENVIOS
      :8000         SERVICE      SERVICE    SERVICE
                    :8001         :8002      :8003
          |               |           |           |
          v               v           v           v
    db_auth       db_inventario  db_pedidos  db_envios
     :5432          :5433         :5434       :5435
```

**Principio clave:** Los microservicios NO comparten bases de datos. La unica comunicacion entre servicios es via HTTP (sincrona) a traves del gateway o directamente entre servicios cuando es necesario (ej. Pedidos valida stock contra Inventario).

---

## Stack Tecnologico

| Capa                              | Tecnologia                | Version             |
| --------------------------------- | ------------------------- | ------------------- |
| **Backend**                       | FastAPI (Python)          | >= 0.115.0          |
| **ORM**                           | SQLAlchemy                | >= 2.0.0            |
| **Validacion**                    | Pydantic v2               | >= 2.9.0            |
| **Base de datos**                 | PostgreSQL                | 15                  |
| **Autenticacion**                 | JWT (PyJWT) + bcrypt      | >= 2.8.0 / >= 4.2.0 |
| **Cliente HTTP (inter-servicio)** | httpx                     | >= 0.27.0           |
| **Contenedores**                  | Docker + Docker Compose   | 3.8                 |
| **Documentacion API**             | Scalar (FastAPI)          | >= 1.0.3            |
| **Frontend**                      | React + TypeScript        | 19.x / 6.x          |
| **Build tool**                    | Vite                      | 8.x                 |
| **Estado global**                 | Zustand                   | 5.x                 |
| **Routing**                       | React Router DOM          | 7.x                 |
| **HTTP Client (frontend)**        | Axios                     | 1.x                 |
| **Validacion formularios**        | React Hook Form + Zod     | 7.x / 4.x           |
| **Estilos**                       | Tailwind CSS v4           | 4.x                 |
| **Iconos**                        | Material Symbols Outlined | --                  |

---

## Estructura del Proyecto

```
SmartLogix/
+-- api_gateway/               # Reverse proxy con JWT middleware
|   +-- main.py                   # Enrutamiento y validacion de tokens
|   +-- requirements.txt
|   +-- Dockerfile
|
+-- microservicios/
|   +-- auth_service/             # Registro y login de usuarios
|   |   +-- core/
|   |   |   +-- security.py           # Creacion y verificacion de JWT
|   |   +-- models/
|   |   |   +-- user_model.py         # Modelo SQLAlchemy: UsuarioDB
|   |   +-- schemas/
|   |   |   +-- auth_schema.py        # DTOs Pydantic: LoginRequest, RegisterRequest, etc.
|   |   +-- services/
|   |   |   +-- auth_service.py        # Logica de negocio: registro, autenticacion
|   |   +-- routers/
|   |   |   +-- auth_router.py         # Endpoints: /api/v1/auth/*
|   |   +-- database.py               # Conexion PostgreSQL + sessionmaker
|   |   +-- main.py                   # App FastAPI + Scalar docs
|   |   +-- requirements.txt
|   |   +-- Dockerfile
|   |   +-- .env                      # JWT_SECRET_KEY, JWT_ALGORITHM, etc.
|   |
|   +-- inventario_service/       # CRUD de productos y stock
|   |   +-- models/
|   |   |   +-- producto_model.py      # Modelo SQLAlchemy: ProductoDB
|   |   +-- schemas/
|   |   |   +-- producto_schema.py     # DTOs: ProductoCreate, ProductoUpdate, etc.
|   |   +-- routers/
|   |   |   +-- inventario_router.py   # Endpoints: /api/v1/inventario/*
|   |   +-- database.py
|   |   +-- main.py
|   |   +-- requirements.txt
|   |   +-- Dockerfile
|   |
|   +-- pedidos_service/          # Gestión de pedidos con validacion de stock
|   |   +-- models/
|   |   |   +-- pedido_model.py        # Modelos: PedidoDB + DetallePedidoDB (1:N)
|   |   +-- schemas/
|   |   |   +-- pedido_schema.py       # DTOs: PedidoCreate, PedidoItemCreate, etc.
|   |   +-- services/
|   |   |   +-- inventario_client.py   # Cliente HTTP para validar stock en Inventario
|   |   +-- routers/
|   |   |   +-- pedidos_router.py      # Endpoints: /api/v1/pedidos/*
|   |   +-- database.py
|   |   +-- main.py
|   |   +-- requirements.txt
|   |   +-- Dockerfile
|   |
|   +-- envios_service/           # Gestión de envíos y seguimiento
|       +-- models/
|       |   +-- envio_model.py         # Modelo SQLAlchemy: EnvioDB
|       +-- schemas/
|       |   +-- envio_schema.py         # DTOs: EnvioCreate, EnvioResponse, etc.
|       +-- routers/
|       |   +-- envios_router.py        # Endpoints: /api/v1/envios/*
|       +-- database.py
|       +-- main.py
|       +-- requirements.txt
|       +-- Dockerfile
|
+-- frontend/                     # SPA React + TypeScript
|   +-- src/
|   |   +-- api/                       # Capa de comunicacion HTTP
|   |   |   +-- client.ts                  # Axios instance + JWT interceptor
|   |   |   +-- auth.ts                     # Login y registro
|   |   |   +-- inventario.ts               # CRUD productos
|   |   |   +-- pedidos.ts                  # CRUD pedidos
|   |   |   +-- envios.ts                   # CRUD envios
|   |   +-- components/                # Componentes compartidos
|   |   |   +-- DashboardLayout.tsx         # Layout con sidebar + topbar
|   |   |   +-- Modal.tsx                   # Modal generico reutilizable
|   |   |   +-- ProtectedRoute.tsx          # Guardia de rutas autenticadas
|   |   +-- pages/                     # Vistas de la aplicacion
|   |   |   +-- LoginPage.tsx
|   |   |   +-- RegisterPage.tsx
|   |   |   +-- DashboardPage.tsx
|   |   |   +-- InventarioPage.tsx
|   |   |   +-- PedidosPage.tsx
|   |   |   +-- EnviosPage.tsx
|   |   +-- stores/                    # Estado global (Zustand)
|   |   |   +-- authStore.ts                # user, token, login, logout
|   |   +-- types/                      # Tipos TypeScript
|   |   |   +-- auth.ts
|   |   +-- App.tsx                     # Rutas principales
|   |   +-- main.tsx                    # Entry point
|   |   +-- index.css                  # Tailwind v4 + tema Material Design
|   +-- nginx.conf                     # Configuracion para produccion
|   +-- Dockerfile                     # Build multi-stage (Node -> Nginx)
|   +-- package.json
|   +-- vite.config.ts
|   +-- tsconfig.json
|
+-- docker-compose.yml            # Orquestacion completa
+-- .gitignore
+-- README.md
```

---

## Microservicios

### Auth Service

**Puerto:** 8000 | **Base de datos:** `db_auth` (5432) | **Prefijo de rutas:** `/api/v1/auth`

Responsable de la gestion de identidades: registro de usuarios con hashing de contrasenas y emision de tokens JWT.

**Modelos:**

| Modelo      | Tabla      | Campos                                                                              |
| ----------- | ---------- | ----------------------------------------------------------------------------------- |
| `UsuarioDB` | `usuarios` | `id`, `email` (unique), `password` (bcrypt hash), `nombre`, `rol` (default: "user") |

**Endpoints:**

| Metodo | Ruta                    | Descripcion                          | Protegido |
| ------ | ----------------------- | ------------------------------------ | --------- |
| POST   | `/api/v1/auth/registro` | Registra un nuevo usuario            | No        |
| POST   | `/api/v1/auth/login`    | Autentica y devuelve JWT             | No        |
| GET    | `/api/v1/auth/perfil`   | Retorna datos del token decodificado | Si (JWT)  |

**Capas internas:**

```
auth_router.py  (HTTP) --> AuthService (logica) --> UsuarioDB (modelo) --> PostgreSQL
                         password: bcrypt           |     ^
                         token: PyJWT                |  session inyectada
                                                    |  via Depends(get_db)
```

**Archivo clave:** `core/security.py` -- contiene `crear_token_acceso()` y `verificar_token()`, este ultimo usado como dependencia FastAPI en endpoints protegidos.

---

### Inventario Service

**Puerto:** 8001 | **Base de datos:** `db_inventario` (5433) | **Prefijo de rutas:** `/api/v1/inventario`

CRUD completo de productos con actualizacion de stock dedicada.

**Modelos:**

| Modelo       | Tabla       | Campos                                                                        |
| ------------ | ----------- | ----------------------------------------------------------------------------- |
| `ProductoDB` | `productos` | `id`, `nombre`, `descripcion` (nullable), `precio` (Float), `stock` (Integer) |

**Endpoints:**

| Metodo | Ruta                                      | Descripcion                    |
| ------ | ----------------------------------------- | ------------------------------ |
| GET    | `/api/v1/inventario/productos`            | Lista todos los productos      |
| GET    | `/api/v1/inventario/productos/{id}`       | Obtiene un producto por ID     |
| POST   | `/api/v1/inventario/productos`            | Crea un producto nuevo (201)   |
| PUT    | `/api/v1/inventario/productos/{id}`       | Actualiza un producto completo |
| PUT    | `/api/v1/inventario/productos/{id}/stock` | Actualiza solo el stock        |
| DELETE | `/api/v1/inventario/productos/{id}`       | Elimina un producto            |

**Validaciones en schemas:** `nombre` (2-100 chars), `precio` (gt=0), `stock` (ge=0).

---

### Pedidos Service

**Puerto:** 8002 | **Base de datos:** `db_pedidos` (5434) | **Prefijo de rutas:** `/api/v1/pedidos`

Gestion de pedidos con detalle de items. Valida disponibilidad de stock contra Inventario Service antes de crear un pedido.

**Modelos:**

| Modelo            | Tabla             | Campos                                              | Relacion                |
| ----------------- | ----------------- | --------------------------------------------------- | ----------------------- |
| `PedidoDB`        | `pedidos`         | `id`, `cliente_id`, `estado` (default: "pendiente") | 1:N con DetallePedidoDB |
| `DetallePedidoDB` | `detalle_pedidos` | `id`, `pedido_id` (FK), `producto_id`, `cantidad`   | N:1 con PedidoDB        |

**Endpoints:**

| Metodo | Ruta                          | Descripcion                               |
| ------ | ----------------------------- | ----------------------------------------- |
| GET    | `/api/v1/pedidos`             | Lista todos los pedidos                   |
| GET    | `/api/v1/pedidos/{id}`        | Obtiene un pedido por ID                  |
| POST   | `/api/v1/pedidos`             | Crea pedido (valida stock via Inventario) |
| PUT    | `/api/v1/pedidos/{id}/estado` | Actualiza estado del pedido               |
| DELETE | `/api/v1/pedidos/{id}`        | Elimina un pedido                         |

**Estados permitidos:** `pendiente`, `preparando`, `enviado`, `entregado`, `cancelado`

**Logica de creacion:** Al crear un pedido, se invoca `validar_productos_en_inventario()` de `services/inventario_client.py`, que consulta via HTTP al Inventario Service para verificar que cada producto exista y tenga stock suficiente.

---

### Envios Service

**Puerto:** 8003 | **Base de datos:** `db_envios` (5435) | **Prefijo de rutas:** `/api/v1/envios`

Gestion de envios con codigos de seguimiento auto-generados y gestion de estados.

**Modelos:**

| Modelo    | Tabla    | Campos                                                                                                                                                 |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `EnvioDB` | `envios` | `id`, `pedido_id`, `direccion_entrega`, `comuna`, `ciudad`, `transportista` (nullable), `codigo_seguimiento` (unique), `estado` (default: "pendiente") |

**Endpoints:**

| Metodo | Ruta                         | Descripcion                            |
| ------ | ---------------------------- | -------------------------------------- |
| GET    | `/api/v1/envios`             | Lista todos los envios                 |
| GET    | `/api/v1/envios/{id}`        | Obtiene un envio por ID                |
| POST   | `/api/v1/envios`             | Crea envio (genera codigo `ENV-XXXXX`) |
| PUT    | `/api/v1/envios/{id}/estado` | Actualiza estado del envio             |
| DELETE | `/api/v1/envios/{id}`        | Elimina un envio                       |

**Estados permitidos:** `pendiente`, `preparando`, `despachado`, `en_transito`, `entregado`, `cancelado`

**Logica de creacion:** Al crear un envio, se asigna temporalmente `ENV-temporal` como codigo de seguimiento. Luego de `db.flush()` (que genera el ID), se actualiza a `ENV-{id:05d}` (ej: `ENV-00001`).

---

## API Gateway

**Puerto:** 8080 | **Sin Swagger/OpenAPI publico** (docs_url=None, openapi_url=None)

El API Gateway es el punto de entrada unico para el frontend. Realiza dos funciones principales:

### 1. Enrutamiento

Enruta las peticiones al microservicio correcto analizando el path de la URL:

```python
RUTAS_SERVICIOS = {
    "auth":       "http://api_auth:8000",
    "inventario": "http://api_inventario:8000",
    "pedidos":    "http://api_pedidos:8000",
    "envios":     "http://api_envios:8000"
}
```

Se usa un `api_route` catch-all (`/{path:path}`) que intercepta GET, POST, PUT y DELETE. El gateway parsea el path, determina el servicio destino, construye la URL y reenvia la peticion con `httpx`.

### 2. Autenticacion JWT

El gateway aplica proteccion selectiva:

- **Rutas protegidas:** `POST`, `PUT`, `DELETE` hacia `inventario`, `pedidos`, `envios`
- **Rutas publicas:** Todo lo que pase por `auth`, y los `GET` de cualquier servicio
- **Validacion:** Decodifica el JWT con la misma `SECRET_KEY` del Auth Service y verifica que el `rol` sea `admin`

**Archivos clave:** `api_gateway/main.py`

---

## Frontend

SPA construida con **React 19**, **TypeScript**, **Vite 8** y **Tailwind CSS v4**.

### Estructura de rutas

```
/registro     --> RegisterPage   (publica)
/login        --> LoginPage      (publica)
/dashboard    --> DashboardPage  (protegida)
/inventario   --> InventarioPage (protegida)
/pedidos      --> PedidosPage    (protegida)
/envios       --> EnviosPage     (protegida)
*             --> redirige a /login
```

### Estado global (Zustand)

`authStore.ts` maneja el estado de autenticacion:

- `user` (id, nombre, rol) -- persistido en `localStorage`
- `token` (JWT) -- persistido en `localStorage`
- `isAuthenticated` -- derivado de la existencia del token
- `login()` / `logout()` -- actions que sincronizan Zustand + localStorage

### Capa API (`src/api/`)

Cada servicio tiene su propio modulo con types y funciones async que consumen el gateway a traves de la instancia centralizada de Axios (`client.ts`):

- **`client.ts`** -- Axios instance con `baseURL` configurable via `VITE_API_URL` y request interceptor que inyecta el JWT desde `localStorage`
- **`auth.ts`** -- `login()` y `register()`
- **`inventario.ts`** -- CRUD completo de productos
- **`pedidos.ts`** -- CRUD + cambio de estado
- **`envios.ts`** -- CRUD + cambio de estado

### Validacion de formularios

Se utiliza **React Hook Form** + **Zod** para validacion declarativa en Login y Register:

- `loginSchema`: email + password requeridos
- `registerSchema`: nombre (min 2 chars), email valido, password (min 8 chars), aceptar terminos

### Diseno visual

- **Tailwind CSS v4** con tema custom Material Design (definido en `index.css` con `@theme`)
- Paleta de colores basada en surface/primary/secondary/tertiary/error containers
- Tipografia: Manrope (headlines) + Inter (body)
- Iconografia: Material Symbols Outlined

### Componentes clave

| Componente        | Archivo               | Funcion                                             |
| ----------------- | --------------------- | --------------------------------------------------- |
| `DashboardLayout` | `DashboardLayout.tsx` | Sidebar + topbar + `<Outlet>` para rutas protegidas |
| `Modal`           | `Modal.tsx`           | Modal generico reutilizable con backdrop blur       |
| `ProtectedRoute`  | `ProtectedRoute.tsx`  | Redirige a `/login` si no hay token                 |

---

## Patrones de Arquitectura y Diseno

### Arquitectura de Microservicios

Cada servicio tiene su propia base de datos, su propio ciclo de despliegue y su propia responsabilidad de dominio. No hay comparticion de esquemas entre servicios.

| Archivo              | Donde se aplica                                         |
| -------------------- | ------------------------------------------------------- |
| `docker-compose.yml` | Orquestacion de 4 DBs + 4 APIs + 1 Gateway + 1 Frontend |
| Cada `database.py`   | Conexion independiente a su propia instancia PostgreSQL |

### Arquitectura en Capas (Layered Architecture)

Cada microservicio sigue la estructura en tres capas:

```
Routers (HTTP)  -->  Services (Business Logic)  -->  Models (Persistence)
   |                      |                              |
   |  DTOs (Pydantic)     |                              |
   |  input/output        |                              |
   v                      v                              v
 Validacion           Logica de negocio          Tablas SQLAlchemy
```

| Capa             | Archivo                                                                           | Responsabilidad                                                                  |
| ---------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Router**       | `auth_router.py`, `inventario_router.py`, `pedidos_router.py`, `envios_router.py` | Recibe HTTP, valida schemas, delega al service, retorna respuesta                |
| **Schema (DTO)** | `auth_schema.py`, `producto_schema.py`, `pedido_schema.py`, `envio_schema.py`     | Define la forma de los datos de entrada y salida                                 |
| **Service**      | `auth_service.py`, `inventario_client.py`                                         | Contiene la logica de negocio (hashing, validacion, comunicacion inter-servicio) |
| **Model**        | `user_model.py`, `producto_model.py`, `pedido_model.py`, `envio_model.py`         | Mapeo ORM a tablas PostgreSQL                                                    |

### DTO (Data Transfer Object)

Los schemas de Pydantic actuan como DTOs, separando los datos que el cliente envia/recibe de la representacion interna en la base de datos.

| Patron         | Aplicacion                                                                                |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Input DTO**  | `LoginRequest`, `RegisterRequest`, `ProductoCreate`, `PedidoCreate`, `EnvioCreate`        |
| **Output DTO** | `LoginResponse`, `UsuarioResponse`, `ProductoResponse`, `PedidoResponse`, `EnvioResponse` |
| **Update DTO** | `ProductoUpdate`, `StockUpdate`, `EstadoPedidoUpdate`, `EstadoEnvioUpdate`                |

**Donde:** Cada archivo `schemas/*.py` del servicio correspondiente.

**Ejemplo concreto:** Al registrar un usuario, el cliente envia un `RegisterRequest` (email, password, nombre). El servicio hashea la password, crea el `UsuarioDB`, y retorna un `UsuarioResponse` que **excluye** el hash de la contrasena.

### Service Pattern (Facade)

La clase `AuthService` encapsula la logica de negocio detras de metodos estaticos (`@staticmethod`), ocultando del router los detalles de bcrypt, JWT y consultas a la base de datos.

```python
# auth_router.py - El router no sabe como se hashea ni como se genera el token
nuevo_usuario = AuthService.registrar_usuario(db, datos)
usuario_autenticado = AuthService.autenticar_usuario(db, credenciales)
```

**Donde:** `microservicios/auth_service/services/auth_service.py`

### Dependency Injection

FastAPI proporciona el sistema `Depends()` para inyectar dependencias en los endpoints:

| Inyeccion                                        | Uso                                                   |
| ------------------------------------------------ | ----------------------------------------------------- |
| `db: Session = Depends(get_db)`                  | Inyeccion de la sesion de base de datos               |
| `usuario_token: dict = Depends(verificar_token)` | Inyeccion del middleware JWT (solo en `/auth/perfil`) |

**Donde:** Todos los routers de cada microservicio.

### Unit of Work

SQLAlchemy implement el patron Unit of Work a traves del objeto `Session`. Cada operacion de escritura sigue el flujo:

```python
db.add(entity)    # Prepara la operacion
db.commit()       # Ejecuta todas las operaciones pendientes en una transaccion
db.refresh(entity) # Actualiza el objeto con los datos generados por la DB (ej: id)
```

**Donde:** Todos los services y routers que realizan escrituras.

### Patron Observer (Frontend)

El estado global con Zustand implementa el patron Observer: los componentes se suscriben a slices del store y se re-renderizan solo cuando ese slice cambia.

```typescript
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const user = useAuthStore((state) => state.user);
```

**Donde:** `frontend/src/stores/authStore.ts`, consumido en `ProtectedRoute.tsx`, `DashboardLayout.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`.

### Interceptor Pattern (Frontend)

El modulo `client.ts` implementa un interceptor de request que inyecta automaticamente el header `Authorization: Bearer <token>` en cada peticion HTTP, eliminando la necesidad de pasar el token manualmente en cada llamada.

**Donde:** `frontend/src/api/client.ts`

---

## Comunicacion Entre Servicios

La unica comunicacion inter-servicio existente es:

```
PEDIDOS SERVICE  --HTTP GET-->  INVENTARIO SERVICE
```

Cuando se crea un pedido, `pedidos_service` invoca `validar_productos_en_inventario()` que:

1. Con httpx, realiza un `GET` a `INVENTARIO_SERVICE_URL/api/v1/inventario/productos/{id}` por cada producto en el pedido
2. Verifica que el producto exista (404 = no encontrado)
3. Verifica que el stock sea suficiente (`producto.stock >= cantidad`)
4. Si algun producto falla, lanza HTTPException con el detalle del error

```python
# pedidos_service/services/inventario_client.py
INVENTARIO_SERVICE_URL = os.getenv("INVENTARIO_SERVICE_URL", "http://localhost:8001")
```

**En Docker Compose**, esta URL se sobreescribe a `http://api_inventario:8000` mediante la variable de entorno `INVENTARIO_SERVICE_URL`.

---

## Flujo de Autenticacion

```
1. REGISTRO
   POST /api/v1/auth/registro { email, password, nombre }
         |
         v
   AuthService.registrar_usuario():
     - Verifica si email ya existe
     - Hashea password con bcrypt
     - Crea UsuarioDB en db_auth
     - Retorna UsuarioResponse (sin password)

2. LOGIN
   POST /api/v1/auth/login { email, password }
         |
         v
   AuthService.autenticar_usuario():
     - Busca usuario por email
     - Verifica password con bcrypt.checkpw()
     - Genera JWT con { sub, id, rol }
     - Retorna { id, nombre, rol, token }

3. ACCESO PROTEGIDO
   Request -> API Gateway
              |
              v
           Si POST/PUT/DELETE a inventario|pedidos|envios:
             - Extrae header Authorization
             - Decodifica JWT
             - Verifica rol == "admin"
             - Si falla: 401 o 403
```

---

## Base de Datos por Servicio

| Servicio   | Base de datos   | Puerto Host | Contenedor Docker             | Volumen                 |
| ---------- | --------------- | ----------- | ----------------------------- | ----------------------- |
| Auth       | `db_auth`       | 5432        | `smartlogix_postgres_auth`    | `postgres_data_auth`    |
| Inventario | `db_inventario` | 5433        | `smartlogix_postgres_inv`     | `postgres_data_inv`     |
| Pedidos    | `db_pedidos`    | 5434        | `smartlogix_postgres_pedidos` | `postgres_data_pedidos` |
| Envios     | `db_envios`     | 5435        | `smartlogix_postgres_envios`  | `postgres_data_envios`  |

Todas las bases de datos usan PostgreSQL 15 con credenciales `postgres/postgres`.

La creacion de tablas es automatica al iniciar cada servicio mediante:

```python
Base.metadata.create_all(bind=engine)
```

---

## Orquestacion con Docker Compose

El archivo `docker-compose.yml` define **10 contenedores**:

| Servicio         | Container                     | Puerto Host | Dependencias                                      |
| ---------------- | ----------------------------- | ----------- | ------------------------------------------------- |
| `db_auth`        | `smartlogix_postgres_auth`    | 5432:5432   | --                                                |
| `api_auth`       | `smartlogix_api_auth`         | 8000:8000   | db_auth                                           |
| `db_inventario`  | `smartlogix_postgres_inv`     | 5433:5432   | --                                                |
| `api_inventario` | `smartlogix_api_inventario`   | 8001:8000   | db_inventario                                     |
| `db_pedidos`     | `smartlogix_postgres_pedidos` | 5434:5432   | --                                                |
| `api_pedidos`    | `smartlogix_api_pedidos`      | 8002:8000   | db_pedidos, api_inventario                        |
| `db_envios`      | `smartlogix_postgres_envios`  | 5435:5432   | --                                                |
| `api_envios`     | `smartlogix_api_envios`       | 8003:8000   | db_envios                                         |
| `gateway`        | `smartlogix_api_gateway`      | 8080:8080   | api_auth, api_inventario, api_pedidos, api_envios |
| `frontend`       | `smartlogix_frontend`         | 5173:80     | gateway                                           |

**Nota:** Los puertos internos de las APIs son todos 8000. Los puertos host varian (8000-8003) para desarrollo local. Dentro de la red Docker, los servicios se comunican por nombre de contenedor en el puerto 8000.

**Frontend:** Build multi-stage. Primero compila con Node.js 20 Alpine y luego sirve con Nginx en el puerto 80.

**Variables de entorno clave:**

- `api_pedidos`: `INVENTARIO_SERVICE_URL=http://api_inventario:8000`
- `gateway`: Lee `.env` del auth_service para compartir `JWT_SECRET_KEY`
- `frontend`: `VITE_API_URL=http://localhost:8080`

**Volumenes:** 4 volumenes nombrados para persistencia de datos PostgreSQL.

---

## Documentacion de API

Cada microservicio expone documentacion interactiva via **Scalar** en el endpoint `/docs`:

| Servicio   | URL (local)                |
| ---------- | -------------------------- |
| Auth       | http://localhost:8000/docs |
| Inventario | http://localhost:8001/docs |
| Pedidos    | http://localhost:8002/docs |
| Envios     | http://localhost:8003/docs |

Los endpoints nativos de Swagger UI (`/docs`) y ReDoc (`/redoc`) estan deshabilitados en favor de Scalar:

```python
app = FastAPI(
    docs_url=None,
    redoc_url=None
)
```

El **API Gateway** no expone documentacion propia (`openapi_url=None`).

---

## Guia de Inicio Rapido

### Requisitos previos

- Docker y Docker Compose instalados
- (Opcional para desarrollo local sin Docker) Python 3.11+, Node.js 20+

### Levantar el proyecto completo

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd SmartLogix

# Crear archivo .env para el auth service
echo "JWT_SECRET_KEY=tu_clave_secreta_aqui" > microservicios/auth_service/.env
echo "JWT_ALGORITHM=HS256" >> microservicios/auth_service/.env
echo "JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60" >> microservicios/auth_service/.env

# Levantar todos los servicios
docker-compose up -d --build
```

La aplicacion estara disponible en:

| Recurso                  | URL                        |
| ------------------------ | -------------------------- |
| Frontend                 | http://localhost:5173      |
| API Gateway              | http://localhost:8080      |
| Auth API (directo)       | http://localhost:8000/docs |
| Inventario API (directo) | http://localhost:8001/docs |
| Pedidos API (directo)    | http://localhost:8002/docs |
| Envios API (directo)     | http://localhost:8003/docs |

### Desarrollo local sin Docker

```bash
# Backend - cada servicio en su propia terminal
cd microservicios/auth_service && uvicorn main:app --port 8000 --reload
cd microservicios/inventario_service && uvicorn main:app --port 8001 --reload
cd microservicios/pedidos_service && uvicorn main:app --port 8002 --reload
cd microservicios/envios_service && uvicorn main:app --port 8003 --reload

# Frontend
cd frontend && npm install && npm run dev
```

---

## Variables de Entorno

### Auth Service (`microservicios/auth_service/.env`)

| Variable                          | Descripcion                          | Default   |
| --------------------------------- | ------------------------------------ | --------- |
| `JWT_SECRET_KEY`                  | Clave secreta para firmar tokens JWT | Requerido |
| `JWT_ALGORITHM`                   | Algoritmo de encriptacion            | `HS256`   |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Tiempo de expiracion del token       | `60`      |

### API Gateway

Hereda las variables del Auth Service via `env_file` en Docker Compose. Necesita `JWT_SECRET_KEY` para validar tokens.

### Pedidos Service

| Variable                 | Descripcion                | Default (local)         |
| ------------------------ | -------------------------- | ----------------------- |
| `INVENTARIO_SERVICE_URL` | URL del Inventario Service | `http://localhost:8001` |

En Docker Compose se sobreescribe a `http://api_inventario:8000`.

### Frontend

| Variable       | Descripcion              | Default                 |
| -------------- | ------------------------ | ----------------------- |
| `VITE_API_URL` | URL base del API Gateway | `http://localhost:8080` |

---

## Notas de Diseño

- **No hay endpoints PATCH**: Las actualizaciones se realizan con PUT (producto completo) o endpoints dedicados (estado, stock).
- **No hay tests actualmente**: El proyecto no incluye suite de tests unitarios ni de integracion.
- **El gateway filtra por rol admin**: Las operaciones de escritura en inventario, pedidos y envios requieren `rol=admin` en el JWT. Los GET son publicos.
- **Generacion de codigos de seguimiento**: Los envios generan automaticamente `ENV-XXXXX` usando el ID auto-incremental de la base de datos.
- **Cascada en pedidos**: `DetallePedidoDB` usa `cascade="all, delete-orphan"` para que al eliminar un pedido se eliminen sus detalles.
