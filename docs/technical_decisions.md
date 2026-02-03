# Decisiones técnicas — Atom Tech Challenge (To‑Do App)

Este documento resume cómo está construido el proyecto, por qué se tomaron ciertas decisiones
y cuáles son los tradeoffs más importantes que se evaluaron durante el desarrollo.

El objetivo no es solo describir la implementación actual, sino dejar claro qué habría que cambiar o
endurecer para pasar de un reto técnico a un sistema productivo.

---

## 1. Arquitectura general

### 1.1 Monorepo fullstack

El proyecto está organizado como un **monorepo** con tres paquetes principales:

- `front/` — Aplicación Angular 17 (login + gestión de tareas).
- `back/` — API REST con Express + TypeScript, pensada para ejecutarse como Firebase Cloud Function.
- `shared/` — Tipos TypeScript + **schemas Zod** compartidos entre front y back.

**Razones:**

- Evitar desalineación entre contratos front/back (tipos y DTOs compartidos).
- Simplificar el desarrollo local: un solo `npm install` en la raíz y scripts que levantan ambos lados.
- Facilitar el uso de herramientas de CI/CD (un solo repositorio, un solo pipeline).

**Tradeoffs:**

- El monorepo agrega algo de complejidad a los scripts (hay que orquestar `front/` y `back/` desde la raíz).
- Para un proyecto muy pequeño podría ser “demasiado”, pero para un reto fullstack ayuda a demostrar
  buenas prácticas que escalan.

---

## 2. Backend — decisiones principales

### 2.1 Express + TypeScript (en vez de NestJS u otros frameworks)

El enunciado pide explícitamente **Express + TypeScript** y despliegue en Cloud Functions, por lo que
el backend se construyó sobre ese stack, sin introducir frameworks adicionales como NestJS.

**Pros:**

- Se respeta al 100% la consigna técnica.
- El código de Express es fácil de leer para cualquier desarrollador Node.
- Menos boilerplate: una sola app de Express, routers por recurso y middlewares explícitos.

**Contras / tradeoffs:**

- No se dispone de DI, pipes, guards y demás helpers que sí tendríamos con NestJS.
- La estructura en capas (routes → services → repositories) debe mantenerse por disciplina,
  no por estructura de framework.

Se compensa usando una separación clara de responsabilidades:

- **Routes**: definen endpoints y se encargan de parsear/validar input con Zod.
- **Services**: contienen reglas de negocio (por ejemplo, lógica de login, flujo de confirmación de creación).
- **Repositories**: encapsulan el acceso a Firestore (queries, colecciones, filtros).

---

### 2.2 Firestore como base de datos

La persistencia se implementa con **Firestore** usando el **Firebase Admin SDK**.

**Motivaciones:**

- Para un dominio simple (usuarios + tareas) el modelo documento/colección encaja bien.

**Tradeoffs:**

- El modelo de consultas es más limitado que en una base relacional (no hay joins, agregaciones complejas, etc.).
- La estructura de datos debe pensarse para queries concretas (colecciones, índices compuestos), aunque en este reto
  el volumen es pequeño.
- Las transacciones y la consistencia eventual de Firestore se vuelven relevantes cuando hay mucha concurrencia,
  pero no es un problema en el contexto del challenge.

---

### 2.3 Pensado para Firebase Cloud Functions

El archivo `back/src/index.ts` expone la app Express como una **Cloud Function HTTP**:

```ts
import * as functions from "firebase-functions";
import { app } from "./app";

export const api = functions.https.onRequest(app);
```

Esto permite:

- Ejecutar el mismo código en local (con `ts-node-dev`) y en Firebase Functions sin bifurcar la lógica.
- Aprovechar el Firestore Emulator + Functions Emulator durante el desarrollo local.

**Decisiones relacionadas:**

- El backend es **stateless**: no hay sesiones en memoria, todo se basa en tokens.
- La configuración se lee de variables de entorno, lo que encaja bien con Cloud Functions y GitHub Actions.
- No se usan features específicas de frameworks (como NestJS), para que la migración a Cloud Functions sea directa.

**Qué faltaría para producción:**

- Scripts de deploy con `firebase deploy --only functions,hosting` conectados al proyecto real.
- Reglas de seguridad de Firestore explícitas (aquí la seguridad se implementa a nivel API, no en reglas).

---

### 2.4 Modelo de autenticación y seguridad

El reto pide un login **solo con email**, sin password. Se eligió:

- Emitir un **JWT Propio** después del “login” o creación de usuario.
- Adjuntar este JWT en el header `Authorization: Bearer <token>` desde el frontend.
- Resolver el usuario en un middleware de auth en backend.

**Flujo de login (resumen):**

1. Front envía `POST /api/auth/sign-in` con `{ email }`.
2. Backend busca usuario por email:
   - Si existe: genera JWT y lo devuelve.
   - Si no existe: crea usuario, genera JWT y lo devuelve.
3. Front guarda `user` + `token` en `localStorage` y navega a `/tasks`.

**Tradeoffs conscientes:**

- No hay contraseña ni verificación de email porque la **consigna explícitamente dice** que
  el login solo pide correo y que, si no existe, se cree el usuario.
- Es un modelo válido para un entorno de demo o herramienta interna, **no para producción expuesta a internet**.
- El backend incluye un modo “inseguro” (`ALLOW_INSECURE_HEADER_AUTH`) que permite autenticarse vía headers
  `x-user-id` y `x-user-email` para debugging local; este modo está pensado solo para desarrollo.

**Qué habría que reforzar en producción:**

- Flujos de verificación de email (enlace mágico / OTP).
- Rotación y almacenamiento seguro de `JWT_SECRET` (Secret Manager, etc.).
- Tiempos de expiración más agresivos y refresh tokens.
- Auditoría de acciones por usuario (logs estructurados).

---

### 2.5 Validación y contratos con Zod

Tanto `front/` como `back/` consumen tipos y schemas desde `shared/`:

- Los DTOs (`TaskDto`, `CreateTaskDto`, `UpdateTaskDto`, `UserDto`, etc.) se definen con **Zod**.
- En el backend, se usa un middleware genérico `validateBody(schema)` para validar `req.body`
  antes de llegar al servicio.
- El frontend puede reutilizar los mismos schemas para validar formularios y parsear respuestas,
  evitando duplicar reglas.

**Pros:**

- Menos riesgo de drift entre front y back (un solo lugar define el shape de los datos).
- Errores de validación consistentes y tipados.
- Facilita la evolución de contratos: cambiar schema en `shared/` y actualizar ambos lados.

**Contras / cosas pendientes:**

- Las respuestas no se validan sistemáticamente con Zod; en un sistema crítico podría ser útil validar también lo que enviamos al cliente.

---

### 2.6 Capas internas (routes → services → repositories)

El backend sigue una separación sencilla pero intencional:

- **Routes** (`back/src/routes/*.routes.ts`):
  - Registran endpoints Express.
  - Aplican middlewares de validación (Zod) y de auth.
  - Transforman errores de validación en respuestas HTTP 4xx.

- **Services** (`back/src/services/*.service.ts`):
  - Contienen lógica de negocio (por ejemplo, cómo se interpreta `status` y `sort` al listar tareas).
  - Orquestan varios repositorios si hace falta.

- **Repositories** (`back/src/repositories/*.repository.ts`):
  - Encapsulan el acceso a Firestore (colecciones, queries, limit, orderBy).
  - Permiten cambiar de backend de datos (por ejemplo, a una base relacional) con impacto acotado.

**Tradeoff:** no se llega a una Arquitectura Hexagonal “pura” (ports/adapters explícitos), pero se aplica
el mismo espíritu: separar IO (routes/Firestore) de reglas de negocio (services). Para el tamaño del reto,
esto es suficiente y legible para el revisor.

---

### 2.7 Manejo de errores

El backend tiene un middleware de errores que centraliza:

- Errores de validación (Zod) → 400.
- Errores de autenticación/autorización → 401 / 403.
- Errores inesperados → 500, con logging controlado.

**Decisión:** minimizar el número de códigos HTTP “raros” y centrarse en:

- `200/201` para éxito.
- `400` para input inválido.
- `401/403` para auth/permissions.
- `404` cuando un recurso no existe.
- `500` para fallos inesperados.

Esto hace que la API sea predecible para el frontend y fácil de testear.

---

## 3. Frontend — decisiones principales

### 3.1 Angular 17 standalone + organización de features

El frontend usa Angular 17 con **componentes standalone**, sin módulos tradicionales:

- `core/`: servicios compartidos (auth, http, interceptores, guard).
- `features/auth/`: páginas y componentes relacionados al login.
- `features/tasks/`: layout y páginas para listar/crear/editar tareas.
- `shared/`: componentes menores reutilizables (si aplica).

**Motivaciones:**

- Mostrar conocimiento de Angular moderno (standalone).
- Mantener el routing limpio (lazy loading por feature).
- Evitar sobre-ingeniería de módulos para un proyecto pequeño.

---

### 3.2 Routing, guard e interceptor

Decisiones clave:

- Ruta `/login` como landing de la app.
- Rutas `/tasks/...` protegidas por un **AuthGuard**:
  - Verifica que exista un token válido en `AuthService` (y/o en `localStorage`).
  - Si no hay token, redirige a `/login` con `returnUrl`.
- `AuthTokenInterceptor`:
  - Adjunta `Authorization: Bearer <token>` a todas las requests a `/api/*`.
  - Permite explícitamente “saltar” el auth para algunas llamadas usando un `HttpContextToken` (ej. login).

**Tradeoff:** se evitó introducir state management complejo (NgRx, etc.) y se optó por:

- Signals y servicios singleton para estado de auth.
- Almacenamiento en `localStorage` para persistir sesión entre recargas.

Para el tamaño del reto, esta solución es más que suficiente y muy legible.

---

### 3.3 UI/UX y responsive

El diseño del frontend busca:

- En **desktop**:
  - Pantalla de login con layout inspirado en el branding de Atom (fondo de color + tarjeta de login).
  - Página de tareas con layout de dos columnas: menú lateral + contenido principal.
- En **tablet/móvil**:
  - El menú se colapsa en un **drawer/hamburger**.
  - El contenido pasa a ocupar el ancho completo, manteniendo tipografías y espaciados cómodos.

**Tradeoffs:**

- Se prefirió un diseño custom con CSS + utilidades responsive en lugar de depender fuertemente
  de un framework pesado (por ejemplo, un template completo de Angular Material).
- Se aplica un equilibrio entre “mostrar que sé hacer responsive” y no convertir el reto en un proyecto
  de diseño puro.

---

## 4. Paquete `shared/` — contratos compartidos

`shared/` contiene:

- **Schemas Zod** para DTOs de usuario y tareas.
- **Tipos TypeScript** derivados de esos schemas.
- Constantes y enums compartidos (por ejemplo, estados de tarea).

**Motivación:**

- Evitar repetir definiciones de contratos en front y back.
- Permitir que los tests de backend usen los mismos schemas que el frontend.

**Tradeoffs:**

- Aumenta un poco la complejidad del tooling (TypeScript path aliases, builds por paquete).
- Obliga a tener un proceso de build coherente en CI/CD (por ejemplo, `npm run build:shared` antes
  de compilar `back/` y `front/`).

---

## 5. Emuladores y desarrollo local

Para facilitar la revisión, se dejó un modo de ejecución simple en local:

- Levantar Firestore Emulator con Firebase CLI.
- Exportar variables de entorno (`FIRESTORE_EMULATOR_HOST`, `FIREBASE_PROJECT_ID`, etc.).
- Levantar backend y frontend con `npm run dev:back` y `npm run dev:front`.

**Tradeoffs:**

- Requiere más pasos (CLI de Firebase + entorno Node/Java), pero es más cómodo para iterar y depurar.

---

## 6. Pruebas y calidad de código

El proyecto está preparado para pruebas pero, por tiempo, la cobertura es limitada.

Decisiones:

- Configuración de runners de test (por ejemplo, Vitest/Jest/Karma según corresponda en back/front).
- Estándares de linting y formateo alineados con TypeScript moderno.
- Uso de Zod para reducir la necesidad de tests “de contrato” duplicados (parte de la validación ya
  está centralizada en schemas).

**Qué faltaría para un entorno productivo:**

- Pruebas de e2e simples en el frontend (ej. con Cypress o Playwright) para validar el flujo completo.

---

## 7. CI/CD y despliegue

El repositorio incluye un workflow de **GitHub Actions** que:

- Ejecuta tests y build en cada push/PR.
- En push a `main`, realiza deploy a Firebase:
  - **Hosting** para el frontend.
  - **Cloud Functions** para el backend (`functions/api`).

**Decisiones de diseño del pipeline:**

- Usar un **service account** con permisos acotados (solo deploy a Hosting/Functions).
- Configurar `FIREBASE_PROJECT_ID` y `FIREBASE_SERVICE_ACCOUNT` como **secrets de GitHub**,
  nunca en el código.
- Mantener el pipeline lo suficientemente simple para que un revisor pueda leerlo en pocos minutos,
  pero mostrando buenas prácticas (cache de `node_modules`, jobs separados para test/build/deploy).

**Tradeoffs:**

- No se incluyeron despliegues a múltiples entornos (staging/prod) para no complejizar el reto.
- No se agregó smoke test post‑deploy por simplicidad; en un sistema real sería buena idea.

---

## 8. Cosas que se simplificaron a propósito

Algunas decisiones se tomaron explícitamente con la frase del enunciado en mente (“Es preferible no
implementar algo a hacerlo mal”):

- **Sin passwords ni gestión compleja de usuarios:** el login por email sin password sigue el enunciado
  literal y evita introducir seguridad “a medias” (passwords sin hashing serio, etc.).
- **Sin DDD/hexagonal hardcore:** se aplica separación en capas y principios SOLID, pero sin añadir
  una arquitectura ceremoniosa que opaque el código a un revisor que viene de otros stacks.
- **Sin over‑design en UI:** se priorizó un diseño limpio y responsive, pero sin convertir esto en
  un ejercicio de maquetación avanzada.

---

## 9. Uso de la IA

### 9.1 Sparring con IA (ChatGPT/Cursor)

Durante el desarrollo se usó un flujo de trabajo de “sparring” con IA:

**Reglas de estilo** (`*.mdc` en `.cursor/rules/`):

- `coding-style.mdc`: guía de estilo de código (nombres, estructura, patrones).
- `express-rules.mdc`: reglas específicas para APIs Express (errores, middlewares, DTOs).
- `unit-test.mdc`: estrategia para diseño de tests (AAA, casos de frontera, etc.).

**Uso práctico:**

Se pidió a la IA generar esqueletos de módulos, servicios y rutas siguiendo estas reglas.

Cada pieza generada fue revisada y ajustada a mano (nombres, mensajes de error, logs, UX del front).

La IA también ayudó a estructurar documentación (como este `README`, `docs/current_status.md`, etc.).

**Decisión consciente:**

La IA se usó como sparring técnico, no como “autocompletado ciego”.

Los flujos críticos (auth, tasks CRUD) se revisaron manualmente para evitar errores de seguridad o desviaciones contra el enunciado.

### 9.2 Flujo de trabajo diario

Desarrollo local principalmente con:

```bash
npm run dev:back
npm run dev:front
```

Verificación de integración end-to-end:

- Front en `http://localhost:4200`
- API en `http://localhost:4000/health` y `http://localhost:4000/api`

**Estándares:**

- Evitar hardcodear URLs absolutas del backend en el front (usar rutas relativas).
- Mantener los contratos en `shared/` como fuente de verdad.
- Validar siempre la entrada en el backend con Zod.

---

### 10. Troubleshooting (para correr la demo)

- **Firestore Emulator (local)**: requiere **Java 21** y Firebase CLI/npx. Si falla, revisa que `FIRESTORE_EMULATOR_HOST=localhost:8080` y `FIREBASE_PROJECT_ID/GCLOUD_PROJECT` estén seteadas.
- **Puertos ocupados**: por defecto se usan `4000` (API), `4200` (front dev), `8080` (emulador).

---

## 11. Resumen

En conjunto, las decisiones técnicas apuntan a:

- Cumplir el enunciado literal (Angular + Express + Firestore + Cloud Functions).
- Mantener el código **legible y trazable** para un revisor en poco tiempo.
- Demostrar criterio en tradeoffs: dónde invertir complejidad (contratos compartidos, auth básico,
  emuladores) y dónde simplificar consciente y honestamente.
