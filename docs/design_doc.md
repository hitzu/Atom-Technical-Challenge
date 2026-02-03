# Backend Design — Todo App (Express + TypeScript + Firestore + Cloud Functions)

Este documento describe el diseño del backend para la aplicación de lista de tareas:

- **API HTTP** sobre **Express + TypeScript**
- Desplegada en **Firebase Cloud Functions**
- Persistencia en **Firebase Firestore**
- Arquitectura inspirada en **Clean/Hexagonal**, pero **simple** para un reto técnico

---

## Índice

- [1. Objetivo del backend](#1-objetivo-del-backend)
- [2. Stack y decisiones principales](#2-stack-y-decisiones-principales)
- [3. Arquitectura y organización de carpetas](#3-arquitectura-y-organización-de-carpetas)
- [4. Modelo de dominio](#4-modelo-de-dominio)
- [5. Persistencia con Firestore](#5-persistencia-con-firestore)
- [6. Endpoints HTTP](#6-endpoints-http)
- [7. Validación de datos (Zod)](#7-validación-de-datos-zod)
- [8. Seguridad y autenticación](#8-seguridad-y-autenticación)
- [9. Manejo de errores](#9-manejo-de-errores)
- [10. Pruebas](#10-pruebas)
- [11. Despliegue en Cloud Functions](#11-despliegue-en-cloud-functions)
- [12. Checklist de implementación](#12-checklist-de-implementación)

---

## 1. Objetivo del backend

El backend debe exponer un API REST simple para:

- Crear usuarios a partir de un email.
- Buscar usuarios por email.
- Gestionar tareas de un usuario:
  - listar,
  - crear,
  - actualizar,
  - eliminar.

Y al mismo tiempo demostrar:

- Buen **diseño de capas** (dominio vs infraestructura).
- **Tipado fuerte** con TypeScript.
- Posibilidad de evolucionar hacia más reglas (auth real, multi-tenant, etc.).

---

## 2. Stack y decisiones principales

### 2.1 Stack

- **Runtime**: Node.js 20 (recomendado por Firebase Functions)
- **Framework HTTP**: Express
- **Cloud**: Firebase Cloud Functions (HTTP functions)
- **DB**: Firebase Firestore
- **Lenguaje**: TypeScript
- **Validación**: Zod (compartible con el frontend en un package común, si se desea)

### 2.2 Por qué NO NestJS aquí

Aunque NestJS facilita modularidad e inyección de dependencias, para este reto:

- El enunciado menciona explícitamente **Express + Typescript + Cloud Functions + Firestore**.
- Meter Nest + adaptador a Cloud Functions puede verse como **overkill** / desviarse de lo pedido.
- Express + una arquitectura limpia ligera son suficientes para demostrar:
  - diseño de capas,
  - principios SOLID básicos,
  - y un código fácil de leer en pocas horas.

Decisión: **Express “puro” con arquitectura limpia ligera**.

---

## 3. Arquitectura y organización de carpetas

Propuesta de estructura:

```txt
backend/
  src/
    domain/
      entities/
        User.ts
        Task.ts
      repositories/
        UserRepository.ts       # interfaces
        TaskRepository.ts
    application/
      usecases/
        CreateUserUseCase.ts
        GetOrCreateUserByEmailUseCase.ts
        ListTasksUseCase.ts
        CreateTaskUseCase.ts
        UpdateTaskUseCase.ts
        DeleteTaskUseCase.ts
      dtos/
        task.dto.ts
        user.dto.ts
    infrastructure/
      firestore/
        FirestoreUserRepository.ts
        FirestoreTaskRepository.ts
      http/
        routes/
          user.routes.ts
          task.routes.ts
        middlewares/
          errorHandler.ts
          validateRequest.ts
        server.ts
    shared/
      config/
        firebase.ts
      validation/
        schemas.ts   # esquemas zod compartibles
  functions/
    index.ts         # entrypoint para cloud functions
  package.json
  tsconfig.json
  README.md
```

### 3.1 Capas

- `domain/`
  - Entidades (`User`, `Task`) sin dependencias de Express/Firestore.
  - Interfaces de repositorio (`UserRepository`, `TaskRepository`).
- `application/`
  - Casos de uso orquestan:
    - validación de input,
    - llamadas a repositorios,
    - reglas de negocio simples.
  - No conocen Express ni Firestore.
- `infrastructure/`
  - Adaptadores:
    - Firestore ↔ `UserRepository`, `TaskRepository`
    - Express ↔ casos de uso
  - Middlewares de Express (errores, validación).
- `shared/`
  - Configuración compartida (Firebase admin, etc.).
  - Esquemas Zod para validación (compartibles con frontend si se crea un `shared/` común).

---

## 4. Modelo de dominio

### 4.1 User

```ts
type UserRole = "USER"; // simple, pero preparado para crecer

interface User {
  id: string; // Firestore document ID
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

**Notas**

- No hay contraseña (el login es solo por email, flujo definido por el reto).
- En el futuro se podría agregar: `displayName`, `provider` (Google, password, etc.), `photoUrl`.

### 4.2 Task

```ts
type TaskStatus = "PENDING" | "COMPLETED";

interface Task {
  id: string;
  userId: string; // referencia al usuario dueño
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  status: TaskStatus;
}
```

**Relación**

- Un `User` tiene muchas `Task`.
- El backend siempre asocia tareas a un `userId` válido.

---

## 5. Persistencia con Firestore

Colecciones propuestas:

```txt
users (collection)
  {userId} (document)
    email: string
    isActive: boolean
    createdAt: Timestamp
    updatedAt: Timestamp

tasks (collection)
  {taskId} (document)
    userId: string
    title: string
    description: string
    status: "PENDING" | "COMPLETED"
    createdAt: Timestamp
    updatedAt: Timestamp
    completedAt: Timestamp | null
```

Alternativa: subcolección `users/{userId}/tasks`, pero para el reto:

- Colección plana `tasks` facilita queries: `where("userId", "==", userId)` + ordenación por `createdAt`.

### 5.1 Reglas mínimas de integridad

- No se crea tarea si `userId` no existe.
- El caso de uso `CreateTaskUseCase` valida que el usuario exista en `UserRepository.getById`.
- Siempre se filtra por `userId` en todas las operaciones sobre tareas.

---

## 6. Endpoints HTTP

Todos los endpoints viven sobre un único Express app expuesto como Cloud Function HTTP.

- **Base**: `/api/v1`

### 6.1 Usuarios

#### `POST /api/v1/users`

Crea usuario explícitamente (útil para tests/debug).

Body:

```json
{
  "email": "user@example.com"
}
```

Respuesta:

```json
{
  "id": "abc123",
  "email": "user@example.com",
  "createdAt": "...",
  "updatedAt": "...",
  "isActive": true
}
```

#### `POST /api/v1/users/get-or-create`

Pensado para login desde el frontend:

- Recibe `{ email }`.
- Si el usuario existe → lo devuelve.
- Si no existe → lo crea y devuelve.

Body:

```json
{
  "email": "user@example.com"
}
```

Respuesta:

- `200 OK` con el usuario (tanto si existía como si se acaba de crear).

### 6.2 Tareas

Para simplificar auth, el `userId` se recibirá en header o query param (ej. `x-user-id`) durante el reto. En una versión más completa se usaría un token JWT o un claim de Firebase Auth.

#### `GET /api/v1/tasks?userId=<id>`

Lista las tareas del usuario, ordenadas por fecha de creación (descendente o ascendente según se defina).

Respuesta:

```json
[
  {
    "id": "t1",
    "userId": "u1",
    "title": "...",
    "description": "...",
    "status": "PENDING",
    "createdAt": "...",
    "updatedAt": "...",
    "completedAt": null
  }
]
```

#### `POST /api/v1/tasks`

Crea una nueva tarea.

Body:

```json
{
  "userId": "u1",
  "title": "Comprar leche",
  "description": "Recordar 2% deslactosada"
}
```

Respuesta:

```json
{
  "id": "t1",
  "userId": "u1",
  "title": "Comprar leche",
  "description": "Recordar 2% deslactosada",
  "status": "PENDING",
  "createdAt": "...",
  "updatedAt": "...",
  "completedAt": null
}
```

#### `PATCH /api/v1/tasks/:taskId`

Actualiza una tarea existente: puede cambiar título, descripción, status (`PENDING`/`COMPLETED`).

Body (ejemplo):

```json
{
  "title": "Comprar leche y pan",
  "status": "COMPLETED"
}
```

Comportamiento:

- Si `status` cambia a `COMPLETED` → set `completedAt = now`.
- Si cambia de `COMPLETED` a `PENDING` → `completedAt = null`.

#### `DELETE /api/v1/tasks/:taskId`

Elimina una tarea del usuario.

Opcional: borrar físicamente (delete) o marcar como `deletedAt` (soft-delete). Para el reto, delete físico es suficiente.

---

## 7. Validación de datos (Zod)

Se usará Zod para:

- Validar payloads de entrada.
- Compartir esquemas con el frontend (opcional) en un package `shared/validation`.

Ejemplos:

```ts
// shared/validation/taskSchemas.ts
export const createTaskSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["PENDING", "COMPLETED"]).optional(),
});
```

En backend, un middleware `validateRequest(schema)`:

- parsea `req.body`,
- si es válido, lo adjunta como `req.validatedBody`,
- si no, responde `400` con detalles.

---

## 8. Seguridad y autenticación

El reto no exige una auth compleja, pero se debe mostrar intención.

### 8.1 MVP

- Frontend obtiene el `userId` desde `get-or-create` y lo guarda en `localStorage`.
- Backend recibe `userId` por header (`x-user-id`) o query param.
- Los endpoints de tareas **SIEMPRE** validan:
  - que `userId` no sea vacío,
  - que la tarea pertenece a ese `userId`.

### 8.2 Futuro (no implementado en el reto, pero documentado)

- Integrar Firebase Auth (JWT) y sacar `userId` de `req.user`.
- Agregar roles y claims (admin, etc.).
- Reemplazar `x-user-id` por `Authorization: Bearer <token>`.

---

## 9. Manejo de errores

Middleware global de errores:

- Errores de validación → `400` (Bad Request).
- Entidad no encontrada → `404`.
- Errores de Firestore → mapeados a `500` y logueados.

Formato uniforme de error:

```json
{
  "error": "BadRequest",
  "message": "Title is required",
  "details": { "...": "..." }
}
```

---

## 10. Pruebas

### 10.1 Unit tests

- Para casos de uso (`application/usecases`): usar repositorios mock (in-memory) que implementan `UserRepository`/`TaskRepository`.
- Para validación (Zod): tests sobre esquemas si da tiempo.

### 10.2 Edge cases a cubrir

- Crear usuario con email inválido → `400`.
- `get-or-create` con email válido:
  - caso 1: usuario existente,
  - caso 2: usuario inexistente (se crea).
- Crear tarea sin título → `400`.
- Actualizar tarea que no existe → `404`.
- Actualizar tarea de otro usuario → `403` o `404` (seguridad básica).
- Cambiar status y verificar `completedAt`.

---

## 11. Despliegue en Cloud Functions

`functions/index.ts` expone algo como:

```ts
import * as functions from "firebase-functions";
import { createApp } from "./src/infrastructure/http/server";

const app = createApp();

export const api = functions.https.onRequest(app);
```

Rutas bajo `/api/v1/...`.

Ventajas:

- Se mantiene la estructura Express limpia.
- El mismo `createApp()` se puede reutilizar para pruebas locales con `npm run dev` usando nodemon y firebase emulators.

---

## 12. Checklist de implementación

Orden recomendado:

- Configurar proyecto TypeScript + Firebase Functions + Express.
- Implementar entidades y repositorios base (`User`, `Task`).
- Implementar repositorios Firestore.
- Implementar casos de uso.
- Implementar rutas + middlewares de validación.
- Probar con Postman / Bruno:
  - flujo de crear usuario / get-or-create,
  - flujo completo de tareas.
- Agregar tests unitarios de casos de uso (mínimos pero claros).
- Documentar en README:
  - cómo levantar emulador,
  - cómo desplegar,
  - ejemplos de requests.
