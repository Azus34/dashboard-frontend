# 🚗 Colibri Arroyo Seco - Dashboard Administrativo

Sistema de gestión integral para transporte compartido desarrollado con React y Node.js.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Secciones del Dashboard](#secciones-del-dashboard)
   - [Panel Principal](#-panel-principal)
   - [Mapa de Rutas](#️-mapa-de-rutas)
   - [Reportes de Viajes](#-reportes-de-viajes)
   - [Usuarios](#-usuarios)
   - [Transacciones](#-transacciones)
   - [Finanzas](#-finanzas)
   - [Analíticas](#-analíticas)
   - [Asistente IA](#-asistente-ia)
5. [Métricas y Cálculos](#métricas-y-cálculos)
6. [Instalación y Configuración](#instalación-y-configuración)
7. [Variables de Entorno](#variables-de-entorno)
8. [Despliegue en Producción](#despliegue-en-producción)

---

## 📖 Descripción General

**Colibri Arroyo Seco** es una plataforma de transporte compartido que conecta conductores con pasajeros en México. Este dashboard administrativo permite:

- Monitorear reservas y viajes en tiempo real
- Gestionar conductores y pasajeros
- Visualizar rutas en mapa interactivo
- Generar reportes financieros
- Analizar métricas de retención de usuarios
- Consultar un asistente de IA para estrategias de negocio

---

## 🛠️ Tecnologías Utilizadas

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.x | Framework principal |
| React Router | 6.x | Navegación SPA |
| Axios | 1.x | Peticiones HTTP |
| Leaflet | 1.9.x | Mapas interactivos |
| Highcharts | 11.x | Gráficas y visualizaciones |
| jsPDF | 2.x | Generación de PDFs |
| CSS Modules | - | Estilos encapsulados |

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | 18.x | Entorno de ejecución |
| Express | 4.x | Framework web |
| PostgreSQL | 14.x | Base de datos relacional |
| MongoDB | 6.x | Base de datos NoSQL (rutas) |
| Google Gemini AI | 2.0-flash | Asistente inteligente |

---

## 📂 Estructura del Proyecto

```
dashboard/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Dashboard/          # Panel principal
│   │   ├── Map/                # Mapa interactivo
│   │   ├── TripReports/        # Reportes de viajes
│   │   ├── Users/              # Gestión de usuarios
│   │   ├── Transactions/       # Historial de transacciones
│   │   ├── FinanceReports/     # Reportes financieros
│   │   ├── Analytics/          # Gráficas y análisis
│   │   ├── AIAssistant/        # Asistente IA
│   │   └── Header/             # Navegación
│   ├── pages/                  # Páginas de rutas
│   ├── services/
│   │   └── api.js              # Configuración de APIs
│   └── App.js                  # Componente raíz
└── package.json

dashboard_backend/
├── config/
│   ├── postgres.js             # Conexión PostgreSQL
│   └── mongodb.js              # Conexión MongoDB
├── routes/
│   ├── analytics.js            # Retención y métricas
│   ├── earnings.js             # Ganancias
│   ├── finances.js             # Recargas y retiros
│   ├── reservations.js         # Reservas
│   ├── routes.js               # Rutas de viaje
│   ├── users.js                # Conductores y pasajeros
│   ├── transactions.js         # Transacciones
│   └── ai.js                   # Asistente IA
└── server.js                   # Punto de entrada
```

---

## 📊 Secciones del Dashboard

### 🏠 Panel Principal

El panel principal muestra un resumen ejecutivo con las métricas clave del negocio:

| Tarjeta | Datos | Fuente de Datos |
|---------|-------|-----------------|
| **Recargas** | Total en MXN + cantidad de transacciones | `wallet_ledger` (tipo TOPUP) |
| **Retiros** | Total en MXN + cantidad de transacciones | `wallet_ledger` (tipo WITHDRAW) |
| **Ganancias** | Comisión del 15% sobre viajes completados | Cálculo: `precio_viaje * 0.15` |
| **Viajes Totales** | Número de rutas registradas | Colección `routes` (MongoDB) |
| **Conductores** | Usuarios con rol `driver` | Tabla `users` (PostgreSQL) |
| **Pasajeros** | Usuarios con rol `customer` | Tabla `users` (PostgreSQL) |
| **Usuarios Activos Hoy** | Usuarios con transacciones hoy | Ver sección de métricas |

#### Retención de Usuarios

La sección de retención mide cuántos usuarios vuelven a usar la plataforma:

| Métrica | Definición | Cálculo |
|---------|------------|---------|
| **Total Usuarios** | Usuarios con al menos 1 viaje | Conteo de usuarios únicos con transacciones |
| **Retención Día 1** | % que volvió al día siguiente | `(usuarios_dia_1 / total_usuarios) * 100` |
| **Retención Día 7** | % que volvió en la primera semana | `(usuarios_dia_7 / total_usuarios) * 100` |
| **Retención Día 30** | % que sigue activo al mes | `(usuarios_dia_30 / total_usuarios) * 100` |

**¿Cómo se valida que un usuario está activo?**

Se considera **activo** a un usuario que tiene registros en la tabla `wallet_ledger` (transacciones de billetera). Los tipos de transacciones que cuentan como actividad son:

- `TOPUP` - Recarga de saldo
- `WITHDRAW` - Retiro de fondos
- `HOLD` - Saldo retenido para viaje
- `RELEASE` - Liberación de fondos
- `TRIP_PAYMENT` - Pago por viaje
- `TRIP_EARNINGS` - Ganancias del conductor
- `REFUND` - Reembolso

```sql
-- Query de usuarios activos por día
SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as active_users
FROM wallet_ledger
WHERE type IN ('TOPUP', 'REFUND', 'RELEASE', 'TRIP_EARNINGS', 'WITHDRAW', 'HOLD', 'TRIP_PAYMENT')
GROUP BY DATE(created_at)
```

**Cálculo de Retención:**

```sql
-- Retención Día 1: Usuarios que tuvieron actividad el día siguiente a su primer uso
-- Retención Día 7: Usuarios que tuvieron actividad dentro de los primeros 7 días
-- Retención Día 30: Usuarios que tuvieron actividad dentro de los primeros 30 días
```

---

### 🗺️ Mapa de Rutas

Mapa interactivo con visualización de todas las rutas de viaje usando **Leaflet** y **OpenStreetMap**.

#### Filtros Disponibles

| Filtro | Color de Línea | Descripción |
|--------|----------------|-------------|
| ✅ **Disponibles** | Verde (#28a745) | Rutas abiertas para reservar |
| 🔄 **En Progreso** | Amarillo (#ffc107) | Viajes actualmente en curso |
| ✔️ **Completadas** | Azul (#007bff) | Viajes finalizados exitosamente |
| ❌ **Canceladas** | Rojo (#dc3545) | Rutas canceladas o expiradas |

#### Marcadores en el Mapa

Cada ruta tiene marcadores con colores únicos para distinguirla:

| Marcador | Símbolo | Información Mostrada |
|----------|---------|---------------------|
| **Origen** | ▲ | Nombre de ubicación, coordenadas, hora de salida |
| **Paradas** | 1, 2, 3... | Nombre de ubicación, número de parada, coordenadas |
| **Destino** | ▼ | Nombre de ubicación final, coordenadas |

#### Geocodificación Inversa

Las direcciones se obtienen automáticamente convirtiendo coordenadas a nombres de lugares usando la API de **OpenStreetMap Nominatim**:

```javascript
// Ejemplo: [lng, lat] → "Calle Principal, Querétaro"
const response = await axios.get(
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
);
```

La geocodificación extrae:
- Nombre de calle (`road`)
- Colonia/barrio (`suburb`, `neighbourhood`)
- Ciudad (`city`, `town`, `village`)

#### Panel Lateral de Detalles

Al hacer clic en una ruta se muestra un panel con:

- **ID de Ruta**: Identificador único (primeros 8 caracteres)
- **ID Conductor**: Identificador del conductor asignado
- **Estado**: Disponible, En Progreso, Completada, Cancelada
- **Asientos Disponibles**: Número de lugares libres
- **Horario**: Fecha y hora programada de salida
- **Precios**: Tarifa por cada tramo del viaje
- **Recorrido Completo**: Origen → Paradas → Destino con colores únicos

#### Detección de Rutas Expiradas

Las rutas se marcan automáticamente como **canceladas** si:
- Tienen un horario programado (`schedule`)
- La fecha/hora de salida ya pasó
- No están marcadas como completadas

```javascript
if (pickupTime < now && route.status !== 'completed') {
  updatedStatus = 'cancelled';
}
```

---

### 📋 Reportes de Viajes

Gestión y análisis de todas las reservas del sistema con generación de reportes PDF.

#### Filtros por Período

| Período | Descripción |
|---------|-------------|
| **Todos** | Todas las reservas históricas |
| **Hoy** | Solo reservas del día actual |
| **Semana** | Últimos 7 días |
| **Mes** | Mes calendario actual |

#### Estadísticas Calculadas

| Métrica | Cálculo | Descripción |
|---------|---------|-------------|
| **Total Reservas** | `reservations.length` | Cantidad total de reservas |
| **Completadas** | `filter(status === 'completed').length` | Viajes finalizados |
| **Pendientes** | `filter(status === 'pending').length` | Esperando confirmación |
| **Canceladas** | `filter(status === 'cancelled').length` | Reservas canceladas |
| **Ingresos Totales** | `SUM(price)` de completados | Suma de precios de viajes completados |
| **Comisión Plataforma** | `ingresos * 0.15` | 15% de comisión para Colibri |

#### Tabla de Reservas

Cada reserva muestra:
- ID de reserva
- ID de ruta asociada
- ID de cliente
- Precio del viaje
- Estado (con color indicativo)
- Fecha de creación
- Fecha de pickup programado

#### Exportación a PDF

El botón **"Exportar PDF"** genera un documento con:
- Encabezado con título y fecha de generación
- Tabla completa de reservas del período
- Resumen estadístico
- Formato profesional para presentación

```javascript
// Usando jsPDF + autoTable
const doc = new jsPDF();
autoTable(doc, {
  head: [['ID', 'Ruta', 'Cliente', 'Precio', 'Estado', 'Fecha']],
  body: reservationsData
});
doc.save('reporte-viajes.pdf');
```

---

### 👥 Usuarios

Gestión de conductores y pasajeros registrados en la plataforma.

#### Esquema de Base de Datos

Los usuarios se clasifican por rol mediante una relación de tres tablas:

```
users ←→ user_roles ←→ roles
```

| Tabla | Campos Principales | Descripción |
|-------|-------------------|-------------|
| `users` | id, email, password_hash, full_name, is_active, created_at, date_birth | Información del usuario |
| `user_roles` | user_id, role_id | Tabla pivote de asignación de roles |
| `roles` | id, code, label | Catálogo de roles (`driver`, `customer`) |

#### Pestañas

| Pestaña | Campos Mostrados |
|---------|------------------|
| **Conductores** | ID, Nombre, Email, Fecha Nacimiento, Rol, Estado, Fecha Registro |
| **Pasajeros** | ID, Nombre, Email, Fecha Nacimiento, Rol, Estado, Fecha Registro |

#### Query para Obtener Usuarios por Rol

```sql
-- Obtener conductores
SELECT 
  u.id, 
  u.full_name, 
  u.email, 
  u.is_active, 
  u.created_at, 
  u.date_birth,
  r.code AS role,
  r.label AS role_label
FROM users u
INNER JOIN user_roles ur ON u.id = ur.user_id
INNER JOIN roles r ON ur.role_id = r.id
WHERE r.code = 'driver'
ORDER BY u.created_at DESC;

-- Obtener pasajeros (mismo query con r.code = 'customer')
```

#### Estados de Usuario

| Estado | Indicador | Descripción |
|--------|-----------|-------------|
| **Activo** | 🟢 Verde | Usuario puede usar la plataforma |
| **Inactivo** | 🔴 Rojo | Usuario deshabilitado |

---

### 💳 Transacciones

Historial completo de movimientos financieros de la billetera digital.

#### Tipos de Transacciones

| Tipo | Descripción | Indicador |
|------|-------------|-----------|
| `TOPUP` | Recarga de saldo a la billetera | 💰 Verde |
| `WITHDRAW` | Retiro de fondos | 💸 Rojo |
| `HOLD` | Saldo retenido mientras se procesa un viaje | ⏳ Amarillo |
| `RELEASE` | Liberación de fondos retenidos | 🔓 Azul |
| `TRIP_PAYMENT` | Pago realizado por un viaje | 🚗 Púrpura |
| `TRIP_EARNINGS` | Ganancias recibidas por el conductor | 💵 Verde |
| `REFUND` | Reembolso por cancelación | ↩️ Naranja |

#### Información por Transacción

| Campo | Descripción |
|-------|-------------|
| ID | Identificador único de la transacción |
| Usuario | Nombre del usuario involucrado |
| Email | Correo del usuario |
| Tipo | Tipo de movimiento (ver tabla anterior) |
| Monto | Cantidad en MXN (convertida desde centavos) |
| Fecha | Fecha y hora de la transacción |

**Nota sobre montos**: Los montos se almacenan en centavos en la base de datos y se dividen entre 100 para mostrar en pesos mexicanos.

```javascript
// Conversión de centavos a pesos
const montoMXN = amount_cents / 100;
```

---

### 💰 Finanzas

Reportes detallados de recargas y retiros con análisis de flujo de efectivo.

#### Tarjetas de Resumen

| Tarjeta | Cálculo | Descripción |
|---------|---------|-------------|
| **Total Recargas** | `SUM(TOPUP.amount_cents) / 100` | Dinero ingresado al sistema |
| **Total Retiros** | `SUM(WITHDRAW.amount_cents) / 100` | Dinero retirado del sistema |
| **Diferencia** | `Recargas - Retiros` | Saldo neto (flujo positivo/negativo) |

#### Pestañas de Detalle

**Pestaña Recargas:**
- Lista de todas las recargas ordenadas por fecha
- Usuario, monto, moneda y fecha de cada recarga

**Pestaña Retiros:**
- Lista de todos los retiros ordenados por fecha
- Usuario, monto, moneda y fecha de cada retiro

#### Fuente de Datos

Los datos provienen de la tabla `wallet_ledger` filtrada por tipo:

```sql
-- Recargas
SELECT * FROM wallet_ledger WHERE type = 'TOPUP' ORDER BY created_at DESC;

-- Retiros
SELECT * FROM wallet_ledger WHERE type = 'WITHDRAW' ORDER BY created_at DESC;
```

---

### 📈 Analíticas

Visualizaciones gráficas del rendimiento del negocio usando **Highcharts**.

#### Gráficas Disponibles

**1. Ganancias Diarias (Gráfica de Área)**
- Muestra los últimos 15 días de ganancias
- Comisión del 15% por cada viaje completado
- Color: Verde (#28a745)

**2. Viajes por Día (Gráfica de Barras)**
- Número de viajes completados por día
- Últimos 15 días de actividad
- Permite ver tendencias de demanda

**3. Distribución Financiera (Gráfica de Pastel)**
- Proporción entre Recargas y Retiros
- Visualiza el balance del flujo de dinero

**4. Estado de Rutas (Gráfica de Pastel)**
- Distribución por estado:
  - 🟢 Disponibles
  - 🟡 En Progreso
  - 🔵 Completadas
  - 🔴 Canceladas

#### Tarjetas de Resumen

| Tarjeta | Valor |
|---------|-------|
| Ganancias Totales | Suma de comisiones (15%) |
| Total de Viajes | Número de viajes completados |
| Recargas | Total de dinero ingresado |
| Retiros | Total de dinero retirado |

---

### 🤖 Asistente IA

Asistente estratégico de negocios potenciado por **Google Gemini 2.0-flash**.

#### Características

- Respuestas personalizadas con datos reales del negocio
- Análisis financiero inteligente
- Recomendaciones estratégicas
- Fallback automático si la API falla

#### Temas Disponibles

| Tema | Palabras Clave | Tipo de Respuesta |
|------|----------------|-------------------|
| **Ganancias** | ganancia, ingreso, dinero | Análisis financiero detallado |
| **Crecimiento** | crecimiento, reservas, aumentar | Estrategias de expansión |
| **Finanzas** | financiero, tarifa, precio, costo | Optimización de costos |
| **Expansión** | expansión, ruta, ciudad | Plan de nuevos mercados |
| **Tecnología** | tecnología, app, digital | Innovaciones recomendadas |

#### Datos en Tiempo Real

El asistente recibe contexto actualizado del dashboard:

```javascript
const context = `Datos reales:
- Reservas: ${currentData.totalReservations}
- Completadas: ${currentData.completedTrips}
- Pendientes: ${currentData.pendingReservations}
- Canceladas: ${currentData.cancelledReservations}
- Ingresos: $${currentData.totalRevenue.toFixed(2)} MXN
- Rutas activas: ${currentData.activeRoutes}`;
```

#### Mensaje de Bienvenida Automático

Al cargar la página, el asistente muestra un resumen con:
- Total de reservas
- Viajes completados
- Reservas pendientes
- Ingresos actuales

#### Sistema de Fallback

Si Google Gemini no responde, el sistema genera respuestas inteligentes basadas en los datos del negocio:

```javascript
// Ejemplo de respuesta de fallback para ganancias
return `Análisis de Ganancias - Colibrí Arroyo Seco

**Datos actuales:**
• Reservas totales: ${data.totalReservations}
• Completadas: ${data.completedTrips}
• Ingresos: $${data.totalRevenue.toFixed(2)} MXN

**Recomendaciones:**
1. Recordatorios automáticos a pendientes
2. +20% tarifa en horas pico
3. Programa de referidos`;
```

---

## 📊 Métricas y Cálculos

### Ganancias de la Plataforma

```
Ganancia por viaje = Precio del viaje × 15%
Ganancias totales = SUM(precio de viajes completados) × 0.15
```

**Ejemplo**: Un viaje de $100 MXN genera $15 MXN para la plataforma.

### Retención de Usuarios

La retención mide cuántos usuarios vuelven después de su primer uso:

```
Retención Día 1 = (Usuarios que volvieron el día 1 / Total usuarios) × 100
Retención Día 7 = (Usuarios activos en primeros 7 días / Total usuarios) × 100
Retención Día 30 = (Usuarios activos en primeros 30 días / Total usuarios) × 100
```

### Usuario Activo

Un usuario se considera **activo** cuando tiene al menos una transacción en `wallet_ledger` para la fecha consultada:

```sql
SELECT COUNT(DISTINCT user_id) as active_users
FROM wallet_ledger
WHERE DATE(created_at) = CURRENT_DATE
```

### Conversión de Moneda

Todos los montos se almacenan en **centavos** y se convierten a **pesos** para mostrar:

```javascript
const pesosMXN = centavos / 100;
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+
- npm o yarn

### Instalación

```bash
# Clonar repositorios
git clone https://github.com/Azus34/dashboard-frontend.git
git clone https://github.com/Azus34/dashboard-backend.git

# Instalar dependencias del frontend
cd dashboard-frontend
npm install

# Instalar dependencias del backend
cd ../dashboard-backend
npm install
```

### Ejecución Local

```bash
# Terminal 1 - Backend (puerto 5000)
cd dashboard-backend
npm start

# Terminal 2 - Frontend (puerto 3000)
cd dashboard-frontend
npm start
```

El frontend estará disponible en `http://localhost:3000`
El backend estará disponible en `http://localhost:5000`

---

## 🔐 Variables de Entorno

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)

```env
# PostgreSQL (datos de usuarios, transacciones)
DATABASE_URL=postgresql://usuario:contraseña@host:5432/nombre_db

# MongoDB (rutas y reservas)
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/colibri

# Google AI (Asistente IA)
GOOGLE_API_KEY=tu_api_key_de_gemini

# Puerto del servidor
PORT=5000
```

---

## 🌐 Despliegue en Producción (Render.com)

### Backend

1. Crear nuevo **Web Service** en Render
2. Conectar repositorio `dashboard-backend`
3. Configurar:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Agregar variables de entorno:
   - `DATABASE_URL`
   - `MONGODB_URI`
   - `GOOGLE_API_KEY`

### Frontend

1. Crear nuevo **Static Site** en Render
2. Conectar repositorio `dashboard-frontend`
3. Configurar:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. Agregar variables de entorno:
   - `REACT_APP_API_URL=https://tu-backend.onrender.com/api`

### CORS en Producción

El backend debe tener configurado CORS para aceptar peticiones del frontend:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://tu-frontend.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
```

---

## 📱 Rutas de Navegación

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Dashboard | Panel principal |
| `/map` | Map | Mapa de rutas |
| `/reports` | TripReports | Reportes de viajes |
| `/users` | Users | Gestión de usuarios |
| `/transactions` | Transactions | Historial de transacciones |
| `/finances` | FinanceReports | Reportes financieros |
| `/analytics` | Analytics | Gráficas y análisis |
| `/ai-assistant` | AIAssistant | Asistente IA |

---

## 👥 Equipo de Desarrollo

- **Proyecto**: Colibri Arroyo Seco
- **Tipo**: Sistema de Transporte Compartido
- **Ubicación**: México
- **Versión**: 1.0.0

---

## 📝 Licencia

Este proyecto es propiedad de Colibri Arroyo Seco. Todos los derechos reservados.

---

*Documentación generada el 28 de Noviembre de 2025*
