# SmartLogix

Plataforma B2B de gestión logística para PYMEs de eCommerce. Permite administrar inventario, pedidos y envíos de forma integrada desde un único dashboard. Construido con arquitectura de microservicios, mensajería asíncrona (Saga) y base de datos independiente por servicio.

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
    AUTH SERVICE    INVENTARIO   PEDIDOS    ENVIOS      RABBITMQ
      :8000         SERVICE      SERVICE    SERVICE    :5672 / :15672
                    :8001         :8002      :8003
          |               |           |           |
          v               v           v           v
    db_auth       db_inventario  db_pedidos  db_envios
     :5432          :5433         :5434       :5435
```

**Comunicación inter-servicio:** Los microservicios no comparten bases de datos. La comunicación es asíncrona vía RabbitMQ usando el patrón **Saga Choreography**.

---

## Saga: Flujo de Pedidos

Cuando se crea un pedido, se desencadena una saga de eventos automática:

```
1. POST /pedidos → crea pedido en estado PENDIENTE_STOCK
        │
        ▼
2. Pedidos publica "StockCheckRequested" a RabbitMQ
        │
        ▼
3. Inventario consume el mensaje:
   - Verifica idempotencia (evita doble procesamiento)
   - Valida stock de cada producto
   - Descuenta stock si hay disponible
   - Publica "StockConfirmed" o "StockFailed"
        │
        ▼
4. Pedidos consume la respuesta:
   - Si OK → estado = CONFIRMADO → publica "PedidoConfirmado"
   - Si falla → estado = CANCELADO
        │
        ▼
5. Envios consume "PedidoConfirmado":
   - Crea envío automático con código de seguimiento ENV-XXXXX
```

El cliente recibe respuesta inmediata (HTTP 201) con el pedido en `PENDIENTE_STOCK`. El frontend hace polling cada 2 segundos hasta que el estado cambia a `CONFIRMADO` o `CANCELADO`.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | FastAPI (Python) + SQLAlchemy 2.0 async + asyncpg |
| Base de datos | PostgreSQL 15 (una por servicio) |
| Mensajería | RabbitMQ + aio-pika (async) |
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| Estado global | Zustand |
| Auth | JWT (PyJWT) + bcrypt |
| Contenedores | Docker + Docker Compose |
| Docs API | Scalar |

---

## Inicio Rápido

### Requisitos

- Docker y Docker Compose
- Git

### Levantar el proyecto

```bash
git clone <url-del-repo>
cd SmartLogix

# Crear .env para el auth service
echo "JWT_SECRET_KEY=tu_clave_secreta_aqui" > microservicios/auth_service/.env
echo "JWT_ALGORITHM=HS256" >> microservicios/auth_service/.env
echo "JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60" >> microservicios/auth_service/.env

# Levantar todo (11 contenedores)
docker-compose up -d --build
```

### URLs

| Recurso | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Auth Docs (Scalar) | http://localhost:8000/docs |
| Inventario Docs | http://localhost:8001/docs |
| Pedidos Docs | http://localhost:8002/docs |
| Envios Docs | http://localhost:8003/docs |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |

---

## Estructura del Proyecto

```
SmartLogix/
├── api_gateway/              # Reverse proxy + JWT middleware
├── microservicios/
│   ├── auth_service/         # Registro, login, JWT
│   ├── inventario_service/   # CRUD productos + consumer RabbitMQ
│   ├── pedidos_service/      # Pedidos + saga publisher/consumer
│   └── envios_service/       # Envíos + consumer RabbitMQ (creación automática)
├── frontend/                 # SPA React + TypeScript
├── docker-compose.yml        # 11 contenedores
└── README.md
```

Cada microservicio sigue arquitectura en capas: `routers/ → services/ → models/` con schemas Pydantic como DTOs.

---

## Endpoints por Servicio

| Servicio | Prefijo | Operaciones |
|----------|---------|-------------|
| Auth | `/api/v1/auth` | registro, login, perfil |
| Inventario | `/api/v1/inventario` | CRUD productos, actualizar/descontar stock |
| Pedidos | `/api/v1/pedidos` | CRUD pedidos, cambiar estado |
| Envios | `/api/v1/envios` | CRUD envíos, cambiar estado, editar completo |

Documentación detallada de cada endpoint en Scalar (`/docs` de cada servicio).

---

## Idempotencia

RabbitMQ garantiza *at-least-once delivery* — un mensaje puede entregarse dos veces. Para evitar dobles descuentos de stock:

- **Inventario y Pedidos:** tabla `idempotency_keys` que registra el UUID de cada mensaje procesado
- **Envios:** idempotencia natural — verifica si ya existe un envío para el `pedido_id` antes de crear uno nuevo

---

## Notas de Diseño

- **Database per Service:** cada microservicio tiene su propia PostgreSQL. No hay compartición de esquemas.
- **Async nativo:** todos los servicios usan `AsyncSession` + `asyncpg`. El event loop no se bloquea en queries de DB.
- **Auth desacoplado:** el Auth Service no participa en la saga. Funciona de forma independiente con HTTP/JWT.
- **Gateway como único punto de entrada:** el frontend solo habla con el gateway (8080). Los puertos 8000-8003 están expuestos solo para desarrollo y acceso a docs.
- **Sin Circuit Breaker:** la mensajería asíncrona de RabbitMQ elimina la necesidad de un Circuit Breaker. Si Inventario cae, el mensaje queda en la cola esperando.
- **Creación de envíos:** automática vía saga cuando un pedido se confirma. El endpoint `POST /envios` manual se mantiene para casos edge (devoluciones, retiros en tienda).
- **Sin refresh tokens:** el JWT expira en 60 minutos. Migración a HttpOnly cookies + refresh rotation pendiente.
