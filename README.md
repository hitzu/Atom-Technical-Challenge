# Atom Tech Challenge — Fullstack Monorepo

Aplicación de lista de tareas (To-Do) construida como **monorepo fullstack**:

- `front/` — App en **Angular 17** (login por email + gestión de tareas).
- `back/` — API en **Express + TypeScript** orientada a **Firebase Cloud Functions** usando **Firestore**.
- `shared/` — **Zod schemas + tipos TypeScript compartidos** entre front y back (contratos tipados).

El objetivo es demostrar:

- Buenas prácticas de **arquitectura front/back**.
- Uso de **Firestore + emuladores de Firebase** en desarrollo.
- **Monorepo** sencillo con tipos compartidos.
- Flujo de trabajo realista con **CI/CD y deploy a Firebase Hosting + Functions**.

---

## 1. Modelo de datos (simple)

Este proyecto usa **Firestore** como base de datos NoSQL. Los datos se organizan en dos colecciones principales:

### 1.1 Colección `users`

Representa a los usuarios que inician sesión con su correo.

Campos principales:

| Campo       | Tipo   | Descripción                     |
| ----------- | ------ | ------------------------------- |
| `id`        | string | ID del documento en Firestore.  |
| `email`     | string | Correo electrónico del usuario. |
| `createdAt` | string | ISO datetime de creación.       |

### 1.2 Colección `tasks`

Representa las tareas de cada usuario.

Campos principales:

| Campo         | Tipo    | Descripción                                      |
| ------------- | ------- | ------------------------------------------------ |
| `id`          | string  | ID del documento en Firestore.                   |
| `userId`      | string  | Referencia al `id` del usuario dueño de la tarea |
| `title`       | string  | Título de la tarea.                              |
| `description` | string  | Descripción opcional.                            |
| `completed`   | boolean | `false` = pendiente, `true` = completada.        |
| `createdAt`   | string  | ISO datetime de creación (para ordenar).         |
| `updatedAt`   | string  | ISO datetime de última actualización.            |

> Para más detalle, ver `docs/data_model.md` (opcional, si se quiere extender con ejemplos y diagramas).

---

## 2. Decisiones técnicas clave

### 2.1 Monorepo con tipos compartidos

- Se eligió un **monorepo** (`front/`, `back/`, `shared/`) para:
  - Compartir **tipos y schemas Zod** entre front y back.
  - Reducir inconsistencias de contrato (`DTOs`, payloads de API).
- El paquete `shared/` expone:
  - **Zod schemas** para requests/responses (por ejemplo `TaskCreateSchema`).
  - **Tipos derivados de esos schemas** (`z.infer<typeof TaskCreateSchema>`).

### 2.2 Backend: Express + TypeScript + Firestore (emulador)

- API en **Express + TypeScript** pensada para ejecutarse:
  - Localmente (Node + emulador de Firestore).
  - Como **Cloud Function HTTP** (`back/src/index.ts` exporta `exports.api`).
- Se usa **Firebase Admin SDK** contra:
  - **Firestore emulator** en desarrollo (`FIRESTORE_EMULATOR_HOST`).
  - Un proyecto Firebase real en despliegue (configurado vía `FIREBASE_PROJECT_ID`/service account).
- Validación de entrada con **Zod**:
  - Middleware `validateBody(...)` aplica schemas compartidos.
  - Evita duplicar reglas de validación en front/back.

### 2.3 Frontend: Angular 17 + Auth + Interceptor

- Angular 17 en modo standalone (sin `NgModule` global).
- Estructura por features:
  - `front/src/app/features/auth/...`
  - `front/src/app/features/tasks/...`
- **Auth**:
  - Login con **solo email**.
  - Flujo:
    1. Buscar usuario (`GET /api/users/:email`).
    2. Si no existe → mostrar **diálogo de confirmación**.
    3. Si usuario confirma → `POST /api/auth/sign-in` para crearlo.
    4. Guardar `token` y `user` en `localStorage`.
  - `AuthTokenInterceptor` agrega `Authorization: Bearer <token>` a todas las requests protegidas.
  - `AuthGuard` protege rutas `/tasks/**`.

### 2.4 Validación y contratos (Zod)

- **Back**:
  - Todos los endpoints de escritura (`POST /tasks`, `PATCH /tasks/:id`, etc.) validan con Zod.
- **Front**:
  - Los forms usan `ReactiveFormsModule` y validaciones de Angular.
  - Zod se usa como fuente de verdad de los contratos; el front podría apoyarse en él para validación extra en el futuro (ej. parseo fuerte de responses).

### 2.5 CI/CD y deploy

- **GitHub Actions**:
  - Workflow en `/.github/workflows/ci-cd.yml`.
  - Ejecuta tests y build en PRs.
  - En `push` a `main`, si todo pasa:
    - Despliega a **Firebase Hosting** (frontend).
    - Despliega la Cloud Function de la API (`api`) a **Firebase Functions**.
- Deploy autenticado con **service account JSON** almacenado como secret en GitHub.

---

## 3. Cómo levantar el proyecto (desarrollo)

### 3.1 Opción A — Docker (recomendada para el revisor)

Requisitos:

- Docker Desktop (o Docker Engine + Docker Compose).

Comando:

```bash
docker compose up --build
Servicios:

Frontend: http://localhost:4173

Backend API: http://localhost:4000/api

Health: http://localhost:4000/health

Notas:

El frontend corre en Nginx y hace proxy de /api/* hacia el backend.

El emulador de Firestore corre dentro de la red de Docker; no expone puertos al host (no es necesario abrir la UI del emulador para probar la app).

3.2 Opción B — Desarrollo local sin Docker

Requisitos:

Node.js: ≥ 20

npm

Java 11+ (requerido por Firebase emulators).
Recomendado: Eclipse Temurin (OpenJDK) instalado como JDK por defecto.

Firebase CLI (global o via npx).

3.2.1 Instalar dependencias

Desde la raíz del monorepo:

npm install

3.2.2 Variables de entorno para backend

Valores recomendados para desarrollo:

export PORT=4000
export FIREBASE_PROJECT_ID=demo-project
export GCLOUD_PROJECT=demo-project
export FIRESTORE_EMULATOR_HOST=localhost:8080
export JWT_SECRET=dev-secret
export ALLOW_INSECURE_HEADER_AUTH=true


ALLOW_INSECURE_HEADER_AUTH solo debe usarse en entorno de desarrollo para facilitar debugging.

3.2.3 Levantar Firestore emulator

El repo incluye configuración en back/firebase.json (Firestore en puerto 8080).

Opción A — usando npx (sin instalar nada global):

npx firebase-tools --config back/firebase.json --project demo-project emulators:start --only firestore


Opción B — usando Firebase CLI global:

npm install -g firebase-tools
firebase --config back/firebase.json --project demo-project emulators:start --only firestore

3.2.4 Levantar backend en modo dev

En otra terminal (desde la raíz):

export FIREBASE_PROJECT_ID=demo-project
export GCLOUD_PROJECT=demo-project
export FIRESTORE_EMULATOR_HOST=localhost:8080
npm run dev:back


API base: http://localhost:4000/api

Health: http://localhost:4000/health

3.2.5 Levantar frontend en modo dev

En otra terminal (desde la raíz):

npm run dev:front


Frontend: http://localhost:4200

3.2.6 Conectar front ↔ back en dev local

El frontend llama a rutas relativas (/api/tasks, /api/auth/...).
En Docker, Nginx hace el proxy. Con ng serve, necesitas un proxy config.

Crear front/proxy.conf.json:

{
  "/api": {
    "target": "http://localhost:4000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}


Levantar:

npm run dev:back
npm run dev:front -- --proxy-config proxy.conf.json


Ahora las requests a http://localhost:4200/api/... se proxyan a http://localhost:4000/api/....

4. Overview del sistema (con capturas)

Las rutas de las imágenes son sugeridas. Las capturas se agregan después.

docs/screens/login-desktop.png
Pantalla de login en desktop: layout dividido, logo de Atom y formulario con email + botón de continuar.
Estado de error visible si el backend responde error.

docs/screens/login-mobile.png
Versión móvil del login: fondo en color principal, logo centrado y formulario a ancho completo.

docs/screens/tasks-desktop.png
Página principal de tareas en desktop:

Menú lateral con opciones (lista, crear).

Lista de tareas con columnas: título, descripción, fecha, estado (checkbox).

Botones de editar / eliminar.

docs/screens/tasks-mobile.png
Versión móvil de la página de tareas:

Menú accesible vía botón hamburguesa.

Lista responsive con scroll.

Acciones alineadas para uso táctil.

docs/screens/task-edit.png
Formulario de edición de tarea mostrando cómo se controla el estado completed.

5. Flujo de trabajo de desarrollo
5.1 Organización del código

Front:

features/auth — componentes y servicios de autenticación.

features/tasks — páginas de listado/creación/edición de tareas.

core — servicios compartidos (AuthService, interceptores, guard, helpers).

Back:

routes/ — definición de rutas Express.

services/ — lógica de negocio (auth/tareas).

repositories/ — acceso a Firestore (CRUD de usuarios/tareas).

middlewares/ — auth, manejo de errores, validación.

Shared:

schemas/ — Zod schemas para requests/responses.

types/ — tipos inferidos para uso en front y back.

5.2 Sparring con IA (ChatGPT/Cursor)

Durante el desarrollo se usó un flujo de trabajo de “sparring” con IA:

Reglas de estilo (*.mdc en .cursor/rules):

coding-style.mdc: guía de estilo de código (nombres, estructura, patrones).

express-rules.mdc: reglas específicas para APIs Express (errores, middlewares, DTOs).

unit-test.mdc: estrategia para diseño de tests (AAA, casos de frontera, etc.).

Uso práctico:

Se pidió a la IA generar esqueletos de módulos, servicios y rutas siguiendo estas reglas.

Cada pieza generada fue revisada y ajustada a mano (nombres, mensajes de error, logs, UX del front).

La IA también ayudó a estructurar documentación (como este README, docs/current_status.md, etc.).

Decisión consciente:

La IA se usó como sparring técnico, no como “autocompletado ciego”.

Los flujos críticos (auth, tasks CRUD) se revisaron manualmente para evitar errores de seguridad o desviaciones contra el enunciado.

5.3 Flujo de trabajo diario

Desarrollo local principalmente con:

npm run dev:back
npm run dev:front -- --proxy-config proxy.conf.json


Verificación de integración end-to-end con:

docker compose up --build


Estándares:

Evitar hardcodear URLs absolutas del backend en el front (usar rutas relativas).

Mantener los contratos en shared/ como fuente de verdad.

Validar siempre la entrada en el backend con Zod.

6. CI/CD y deploy a Firebase
6.1 GitHub Actions

Workflow en /.github/workflows/ci-cd.yml:

En Pull Requests a main:

Instala dependencias (root, front, back).

Corre linters/tests (si están configurados).

Corre build (front + back).

En push a main:

Ejecuta el mismo pipeline de validación.

Si todo pasa:

Hace deploy a Firebase Hosting (frontend).

Hace deploy de la función HTTP api a Cloud Functions.

6.2 Secrets necesarios (GitHub → Environments → production)

FIREBASE_PROJECT_ID — ID del proyecto Firebase (ej. atom-todo-12345).

FIREBASE_SERVICE_ACCOUNT — contenido completo del JSON del service account con permisos de:

Firebase Admin

Firebase Hosting Admin

Cloud Functions Admin/Developer

Opcional:

NODE_VERSION — versión de Node usada en los jobs (default: 20).

6.3 Cómo se genera el service account

En Google Cloud Console:

IAM & Admin → Service Accounts.

Crear service account (ej. github-actions-deploy).

Asignar roles:

Firebase Admin

Firebase Hosting Admin

Cloud Functions Developer (o Admin según la política).

Crear key JSON y descargarla.

En GitHub:

Settings → Secrets and variables → Actions.

New secret: FIREBASE_SERVICE_ACCOUNT → pegar JSON completo.

New secret: FIREBASE_PROJECT_ID → ID del proyecto.

7. Comandos desde la raíz

Atajos definidos en package.json de la raíz:

npm run dev — front + back en paralelo (ideal para desarrollo rápido).

npm run dev:back — solo backend.

npm run dev:front — solo frontend (ng serve).

npm run test — tests (cuando estén implementados).

npm run lint — lints de front y back.

8. Trabajo futuro

Agregar suite de tests unitarios e integración (front/back).

Endurecer autenticación (eliminar modos inseguros en producción).

Añadir más validaciones en front usando Zod + mapeo de errores de backend.

Mejorar accesibilidad (focus states, ARIA más exhaustivo, navegación por teclado).

Extender documentación de docs/data_model.md con diagramas y ejemplos de consultas.
```
