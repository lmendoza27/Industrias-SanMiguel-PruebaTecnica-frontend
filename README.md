# 📱 Task Manager Mobile App - Frontend (Angular + Ionic / Capacitor)

Aplicación móvil híbrida desarrollada con **Angular**, **Ionic** y **Capacitor**, construida bajo **Arquitectura Hexagonal** y soporte **Offline-First** utilizando SQLite local y sincronización automática en segundo plano con el backend en Laravel.

---

## 🛠️ Tecnologías y Librerías

- **Framework:** Angular 17+ (Componentes Standalone)
- **Entorno Móvil:** Capacitor 5+/6+ (Ionic Framework)
- **Base de Datos Local:** Capacitor SQLite (para almacenamiento local offline)
- **Peticiones HTTP:** Angular HttpClient con Interceptores
- **Estilos:** CSS3 / Componentes UI de Ionic

---

## 🏗️ Arquitectura del Proyecto (Arquitectura Hexagonal)

El proyecto está organizado aislando el dominio de los detalles técnicos de infraestructura y persistencia:

```plaintext
src/app/tasks/
├── domain/                      # 🟢 NÚCLEO (Interfaces y entidades)
│   └── task.model.ts
│
└── data-access/                 # 🔵 ADAPTADORES (Servicios e Infraestructura)
    ├── auth.service.ts          # Manejo de token JWT en LocalStorage
    ├── task.service.ts          # Cliente HTTP para la API en Laravel
    ├── local-db.service.ts      # Adaptador SQLite Local
    └── sync.service.ts          # Orquestador de sincronización Offline-First
```

---

## 🚀 Funcionalidades Clave

- 📱 **Híbrido Móvil Nativo:** Compilado a APK funcional para Android.
- 🌐 **Soporte Offline-First (Store & Forward):**
  - Permite crear y consultar tareas sin conexión a internet.
  - Genera UUIDs temporales para los registros guardados en SQLite de forma offline.
- 🔄 **Sincronización Automática Evitando Duplicados:**
  - Escuchador en tiempo real de cambios en la interfaz de red (`NetworkListener`).
  - Patrón de bloqueo mediante _Mutex / Flag (`isSyncing`)_ en `SyncService` para evitar condiciones de carrera (Race Conditions) al reconectarse a internet.
- 🔒 **Seguridad & JWT:** Adjunto automático de cabeceras `Authorization: Bearer <token>` en las peticiones a endpoints protegidos.

---

## 🛠️ Configuración y Ejecución Local

### 1. Clonar e instalar dependencias

```bash
git clone [https://github.com/TU_USUARIO/task-manager-frontend.git](https://github.com/TU_USUARIO/task-manager-frontend.git)
cd task-manager-frontend
npm install
```
