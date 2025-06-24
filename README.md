# Proyecto de Backend de Panadería

Este proyecto es una API REST para la gestión integral de una panadería. Está construida con **Node.js**, **Express** y **Sequelize** sobre una base de datos **PostgreSQL**. Proporciona autenticación de usuarios, administración de productos y manejo de pedidos.

## Características principales

- Registro e inicio de sesión de usuarios mediante JSON Web Tokens
- CRUD de productos con imágenes
- Creación y seguimiento de pedidos
- Streaming de eventos de pedidos usando **Server-Sent Events**
- Configuración sencilla mediante variables de entorno

## Requisitos

- Node.js 18 o superior
- Una instancia de PostgreSQL

## Instalación

1. Clona el repositorio
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd Proyect_Bakery-backend
   ```
2. Instala las dependencias
   ```bash
   npm install
   ```
3. Crea un archivo `.env` con el siguiente contenido (ajusta los valores según tu entorno):
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bakery
   DB_USER=usuario
   DB_PASS=contraseña
   JWT_SECRET=clave_secreta
   PORT=4000          # opcional
   # Opcional para exponer tu servidor con ngrok
   NGROK_AUTHTOKEN=tu_token
   # Credenciales para notificaciones por correo
   OWNER_EMAIL=due\@example.com
   OWNER_EMAIL_PASS=contrase\u00f1a
   EMAIL_SERVICE=gmail
   ```
   También puedes utilizar `DATABASE_URL` si empleas un proveedor que lo suministre.

## Ejecución

- **Modo desarrollo**: reinicio automático con `nodemon`
  ```bash
  npm run dev
  ```
- **Modo producción**:
  ```bash
  npm start
  ```
- **Exponer localmente con ngrok** (requiere `NGROK_AUTHTOKEN`):
  ```bash
  npm run tunnel
  ```
- **Poblar la base de datos con datos de ejemplo**:
  ```bash
  node scripts/seed.js
  ```
- **Crear usuario administrador por defecto**:
  ```bash
  node scripts/createAdmin.js
  ```

## Endpoints destacados

- `POST /api/auth/register` – registro de usuarios
- `POST /api/auth/login` – autenticación y obtención de token
- `GET /api/products` – listado de productos
- `POST /api/orders` – creación de un pedido
- `PUT /api/orders/:id/status` – actualizar estado del pedido
- `GET /api/orders/stream` – suscripción a eventos de cambios en pedidos
- `GET/PUT /api/users/profile` – consulta o actualización del perfil

### Ejemplo de payload para registrar un usuario

```json
{
  "name": "Juan",
  "email": "juan@example.com",
  "password": "secreto",
  "phone": "555-1234",
  "address": "Calle Principal 123"
}
```

### Ejemplo para crear un producto

```json
{
  "name": "Pan artesanal",
  "description": "Pan elaborado a mano",
  "price": 3.5,
  "stock": 10,
  "imageUrl": "https://ejemplo.com/pan.png"
}
```

### Cambiar el estado de un pedido

Envia un `PUT` a `/api/orders/:id/status` con un cuerpo como este:

```json
{
  "status": "ready",
  "reason": "opcional si es rechazado"
}
```

Los estados válidos son `pending`, `received`, `preparing`, `ready`, `delivered`, `cancelled` y `rejected`.

## Contribuir

¡Las contribuciones son bienvenidas! Abre un issue o un pull request para proponer mejoras o arreglos.

## Licencia

Distribuido bajo la licencia ISC.
