# Todo API

API REST para gestión de tareas con autenticación, construida como proyecto de aprendizaje de backend con Node.js, TypeScript y arquitectura inspirada en principios Hexagonales.

## Features

- **Autenticación con JWT** — registro y login con contraseñas hasheadas (`bcrypt`).
- **CRUD de tareas** protegido por usuario — cada usuario solo puede ver/editar/eliminar sus propias tareas.
- **Validación de entrada** con [Zod](https://zod.dev/) en cada endpoint (body, query params, route params).
- **Manejo de errores centralizado** — errores de dominio (`AppError`) y de validación (`ZodError`) se traducen a respuestas HTTP consistentes.
- **Rate limiting** en `/login` y `/register` para mitigar fuerza bruta y spam de registros.
- **Seguridad básica** con `helmet` (headers HTTP) y logging de requests con `morgan`.
- **Persistencia con SQLite** (`better-sqlite3`), sin necesidad de un servidor de base de datos externo.
- **Dockerizado**, con volumen persistente para no perder datos entre reinicios del contenedor.

## Stack

| Categoría | Tecnología |
|---|---|
| Runtime | Node.js |
| Lenguaje | TypeScript |
| Framework | Express 5 |
| Base de datos | SQLite (`better-sqlite3`) |
| Validación | Zod |
| Autenticación | JWT (`jsonwebtoken`) + `bcryptjs` |
| Seguridad | `helmet`, `express-rate-limit` |
| Logging | `morgan` |
| Gestor de paquetes | pnpm |
| Contenedores | Docker / Docker Compose |

## Prerrequisitos

- Node.js (el proyecto se desarrolló con Node 26 — corre `node -v` para confirmar tu versión)
- [pnpm](https://pnpm.io/) instalado globalmente
- Docker y Docker Compose (opcional, solo si quieres correrlo en contenedor)

## Instalación y uso

### Opción A: local con pnpm

```bash
# 1. Clonar el repo
git clone <url-del-repo>
cd todo-api

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Levantar en modo desarrollo (con hot-reload)
pnpm dev
```

El servidor queda disponible en `http://localhost:3000`.

### Opción B: con Docker

```bash
# Asegúrate de tener un .env con JWT_SECRET configurado
docker compose up --build
```

Los datos persisten en un volumen de Docker (`todo-data`), así que sobreviven a `docker compose down` / `up`.

## Variables de entorno

| Variable | Requerida | Default | Descripción |
|---|---|---|---|
| `PORT` | No | `3000` | Puerto en el que corre el servidor |
| `JWT_SECRET` | **Sí** | — | Secreto para firmar/verificar JWTs. Mínimo 32 caracteres. Generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NODE_ENV` | No | `development` | `development` \| `production` \| `test` |
| `DB_PATH` | No | `./database.sqlite` | Ruta del archivo SQLite |

Las variables se validan al arrancar con Zod — si falta `JWT_SECRET` o no cumple el largo mínimo, el servidor no inicia y muestra el error específico en consola.

## Endpoints

### Auth (públicos)

| Método | Ruta | Descripción | Rate limit |
|---|---|---|---|
| `POST` | `/api/auth/register` | Crea un usuario nuevo | 10 / hora por IP |
| `POST` | `/api/auth/login` | Inicia sesión, devuelve un JWT | 5 / 15 min por IP |

**Body de `register`:**
```json
{ "name": "Mafe", "email": "mafe@test.com", "password": "clave12345" }
```

**Respuesta de `register` / `login`:**
```json
{
  "token": "eyJhbGc...",
  "user": { "id": 1, "name": "Mafe", "email": "mafe@test.com" }
}
```

### Todos (requieren `Authorization: Bearer <token>`)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/todos` | Crea una tarea |
| `GET` | `/api/todos?page=1&limit=10` | Lista las tareas del usuario (paginado) |
| `GET` | `/api/todos/:id` | Obtiene una tarea por id |
| `PATCH` | `/api/todos/:id` | Actualiza `title` y/o `description` |
| `DELETE` | `/api/todos/:id` | Elimina una tarea |

Intentar acceder a una tarea de otro usuario (o que no existe) devuelve `404`.

## Estructura del proyecto

```
src/
├── config/
│   ├── database.ts      # Inicialización de SQLite (tablas, índices, triggers)
│   └── env.ts            # Validación de variables de entorno con Zod
├── controllers/
│   ├── authController.ts
│   └── todoController.ts
├── middleware/
│   ├── auth.ts            # Verifica el JWT y adjunta req.user
│   ├── errorHandler.ts    # AppError + manejo centralizado de errores
│   └── rateLimiter.ts
├── models/
│   ├── userModel.ts       # Acceso a datos de usuarios (repositorio)
│   └── todoModel.ts       # Acceso a datos de tareas (repositorio)
├── routes/
│   ├── authRoutes.ts
│   └── todoRoutes.ts
├── schemas/                # Schemas de Zod para validar input
├── types/
│   └── express.d.ts        # Augmenta Request con `user`
├── utils/
│   └── jwt.ts               # generateToken / verifyToken
└── index.ts                  # Punto de entrada: monta middlewares, rutas y errorHandler
```

## Documentación de la API

_(pendiente — Swagger/OpenAPI)_