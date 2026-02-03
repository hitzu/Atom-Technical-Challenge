# Future work / Próximos pasos

Este documento enumera mejoras posibles sobre el MVP actual (Angular + Express + Firestore).
La idea es priorizar cambios que aumenten **UX**, **consistencia de datos** y **escalabilidad** sin complicar demasiado el stack.

---

## 1) Mejoras de UX (frontend)

### 1.1 Cachear listado + ids (y evitar “parpadeos”)

- Cachear el resultado de `GET /tasks` (o “notas”) en el state del front para:
  - Evitar refetch al navegar entre pantallas.
  - Mejorar perceived performance.
- Estrategia simple:
  - Mantener en memoria la lista y su timestamp.
  - Invalidar cache en `create/update/delete`.
  - O usar un enfoque “stale-while-revalidate” (mostrar cache y refrescar en background).

### 1.2 Deshabilitar items/acciones mientras se editan

- Mientras una nota está en modo edición:
  - Deshabilitar el row/card o las acciones (guardar/cancelar) para evitar doble submit.
  - Mostrar estado “Saving…” y bloquear interacción hasta respuesta.
- Si hay navegación o filtros, mantener un “dirty state” y confirmar antes de abandonar.

### 1.3 Optimistic UI + rollback

- Aplicar cambios localmente al guardar (optimistic update) y revertir si el API falla.
- Útil especialmente si luego se agrega versionado (ver 2.2) para manejar conflictos.

### 1.4 Listado más robusto

- Paginación / infinite scroll.
- Búsqueda por texto (título/descr.) con debounce.
- Filtros y orden:
  - `status=PENDING|COMPLETED`
  - `sort=asc|desc`

---

## 2) Modelo de datos (campos + versionado de notas)

### 2.1 Campos adicionales recomendados

- `updatedAt` (ISO datetime): mantener trazabilidad de edición y ordenar por “última actualización”.
- `deletedAt` (ISO datetime, opcional): soft-delete (útil si luego quieres “restaurar”).
- `archived` (boolean): separar “hecho” de “archivado”.
- `priority` (enum/int): prioridades de la nota/tarea.
- `dueAt` (ISO datetime, opcional): vencimiento.
- `tags` (string[]): etiquetas para organizar.

### 2.2 Versionado / control de concurrencia (optimistic concurrency)

Objetivo: evitar que dos ediciones pisen cambios sin darse cuenta.

- Agregar campo `version` (int) en la nota.
- En cada `PATCH`, el cliente envía el `version` actual (expectedVersion).
- El backend valida:
  - Si el documento sigue en esa versión → aplica update y hace `version++`.
  - Si no coincide → responde `409 CONFLICT` (el front refresca y pide al usuario resolver).

Alternativas:

- Usar `updatedAt` como “ETag lógico” (si `updatedAt` cambió → conflicto).
- Usar transacciones de Firestore para asegurar atomicidad del check+update.

---

## 3) Firestore: queries e índices

- Evitar filtros en memoria:
  - Hoy `status=PENDING` se filtra en front/back después de traer docs.
  - Mejor: modelar query para filtrar en Firestore (por ejemplo `where('completed','==',false)`).
- Definir índices compuestos necesarios (por ejemplo):
  - `tasks`: `userId + createdAt` (y si agregas filtros, `userId + completed + createdAt`).
- Considerar migrar `createdAt/updatedAt` a `Timestamp` nativo (si se prioriza consistencia/queries).

---

## 4) Backend/API

### 4.1 Endpoints más expresivos

- `GET /tasks?status=...&sort=...&q=...&page=...`
- `PATCH /tasks/:id` con validación de concurrencia (2.2).

### 4.2 Errores consistentes y observabilidad

- Normalizar formato de error `{ error: { code, message, details } }`.
- Logging estructurado (requestId, userId) para debug.

### 4.3 Seguridad

- Reemplazar token DEV por auth real:
  - JWT firmado por backend con expiración.
  - Refresh token (si aplica).
  - Revocación (lista o “tokenVersion” por usuario).
- Rate limiting en endpoints de auth/listado.

---

## 5) Firestore Rules y aislamiento

- Definir reglas para que un usuario solo lea/escriba sus docs:
  - `tasks.userId == request.auth.uid` (si se migra a Firebase Auth real).
- Si se mantiene auth custom: evaluar si el acceso debe ser solo vía backend (no SDK directo).

---
