# Challenge técnico — To-Do App (Angular + API)

Bienvenido/a. En este documento encontrarás los requisitos del reto y los criterios de evaluación. La meta es construir una aplicación de lista de tareas en **Angular** con su **backend** correspondiente.

La aplicación debe permitir al usuario **agregar, editar y eliminar tareas**, así como **marcarlas como completadas**. Se valorará especialmente la calidad del código, buenas prácticas y claridad arquitectónica.

---

### Objetivo

Desarrollar una To‑Do App con:

- **Frontend**: Angular (recomendado Angular 17).
- **Backend**: API en Express + TypeScript, pensada para ser **hosteada en Cloud Functions**.
- **Persistencia**: Firebase **Firestore** para almacenar usuarios y tareas.

---

### Requisitos funcionales (Frontend)

La aplicación consta de **2 páginas**:

1. **Inicio de sesión**
   - Formulario que solicita **solo el correo**.
   - Si el usuario **existe**, navega a la página principal.
   - Si el usuario **no existe**, muestra un **diálogo de confirmación** para crear el usuario.
   - Si se crea el usuario, navega directamente a la página principal.

2. **Página principal (tareas)**
   - Muestra todas las tareas pendientes del usuario **ordenadas por fecha de creación**.
   - Incluye un formulario para **agregar nuevas tareas**.
   - Incluye un botón para **volver al inicio de sesión**.

Cada tarea debe mostrar:

- **Título**
- **Descripción**
- **Fecha de creación**
- **Estado** (completada/pendiente)

Acciones por tarea:

- Marcar como **completada** o **pendiente** mediante una **casilla de verificación**.
- **Editar** una tarea.
- **Eliminar** una tarea.

Requisito de UI:

- La aplicación debe ser **responsive** y adaptarse a diferentes dispositivos.

---

### Requisitos técnicos (Backend / API)

Construir un API con:

- **Express + TypeScript**
- **Despliegue**: orientado a **Cloud Functions**
- **Base de datos**: **Firebase Firestore**

El API deberá soportar estas operaciones:

#### Tareas

- Obtener la lista de todas las tareas.
- Agregar una nueva tarea.
- Actualizar los datos de una tarea existente.
- Eliminar una tarea existente.

#### Usuarios

- Buscar el usuario (verificar si ya fue creado).
- Agregar un nuevo usuario.

---

### Arquitectura y organización (criterios de evaluación)

- **Organización del proyecto**: carpetas, modularidad, separación de capas.
- **Arquitectura**: limpia o hexagonal (si aplica a tu diseño).
- **Patrones de diseño y principios**:
  - SOLID y principios de diseño.
  - Frontend: observables, servicios, componentes bien estructurados.
  - Backend: DDD, repositorios, factories, singletons (según necesidad).
- **Manejo de datos**:
  - Uso eficiente de servicios HTTP.
  - Validaciones y transformación de datos.
  - Seguridad en la comunicación con el API (tokens, autenticación), si decides implementarlo correctamente.
- **Binding y directivas**:
  - Directivas estructurales/personalizadas cuando aplique.
  - Enlace de datos optimizado (one-way, two-way binding, async pipes).
  - Manejo eficiente del DOM (`trackBy` en `ngFor`).
- **Buenas prácticas**:
  - DRY, KISS y YAGNI.
  - TypeScript con tipado, interfaces y/o genéricos cuando aporte valor.
  - Pruebas unitarias e integración (frontend y backend) si tienes tiempo/experiencia.
  - Código documentado y **README** útil.
- **Seguridad backend**:
  - Configuración de CORS y validaciones.
  - Gestión segura de secretos y tokens.
- **Enrutamiento**:
  - Organización del `RouterModule`, guards y lazy loading cuando aplique.
- **Estilo y accesibilidad**:
  - Diseño responsivo con Angular Material / Bootstrap / etc.
  - Consistencia de estilos (SCSS, variables globales).
  - Accesibilidad (ARIA, navegación por teclado).
- **Entrega y despliegue**:
  - Builds optimizados (tree shaking, minificación).
  - CI/CD si lo consideras valioso.
  - Documentación clara del proceso de configuración.

---

### Nota importante

Se evaluará únicamente lo entregado. Si no estás familiarizado/a con algún aspecto, es preferible **no implementarlo** en lugar de hacerlo de manera incorrecta.

No es necesario implementar todo para demostrar tus habilidades: nos interesa ver tu **enfoque**, la **calidad del código** y tus **decisiones técnicas**.

Si lo deseas, puedes incluir funcionalidades extra (por ejemplo: filtros de búsqueda, categorías de tareas o una mejor UX).

---

### Entrega

- Puedes usar una plantilla provista o iniciar desde cero (como te sientas más cómodo/a).
- Carga el código fuente en un **repositorio Git público**.
- Publica la aplicación en **Firebase Hosting** (preferible) o en otro hosting que permita probar online (por ejemplo `https://stackblitz.com/`).
- Incluye en el repositorio una breve documentación (README) con:
  - Decisiones de diseño
  - Tecnologías utilizadas
  - Instrucciones de instalación/ejecución
  - Comentarios de desarrollo (si aplica)

---

### Troubleshooting (para correr la demo)

- **Firestore Emulator (local)**: requiere **Java 21** y Firebase CLI/npx. Si falla, revisa que `FIRESTORE_EMULATOR_HOST=localhost:8080` y `FIREBASE_PROJECT_ID/GCLOUD_PROJECT` estén seteadas.
- **Puertos ocupados**: por defecto se usan `4000` (API), `4200` (front dev), `4173` (front en Docker), `8080` (emulador).
- **Docker compose**: el primer build puede tardar varios minutos (dependencias + build front/back).
