# Proyecto de Backend de Panadería

Este proyecto es una aplicación de backend para la gestión de una panadería. Permite la autenticación de usuarios, la gestión de productos y pedidos, y la interacción con una base de datos.

## Características

- Autenticación de usuarios
- Gestión de productos
- Gestión de pedidos
- Interacción con base de datos PostgreSQL

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   ```
2. Navega al directorio del proyecto:
   ```
   cd Proyect_Bakery-backend
   ```
3. Instala las dependencias:
   ```
   npm install
   ```
4. Configura el archivo `.env` con tus credenciales de base de datos.

## Uso

Para iniciar el servidor en modo desarrollo, ejecuta:
```
npm run dev
```

### Ejemplo de creación de producto

Al enviar una solicitud `POST` a `/api/products`, puedes incluir el campo
`imageUrl` junto con el resto de datos del producto. Ejemplo de payload:

```json
{
  "name": "Pan artesanal",
  "description": "Pan elaborado a mano",
  "price": 3.5,
  "stock": 10,
  "imageUrl": "https://ejemplo.com/pan.png"
}
```

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request para discutir cambios.

## Licencia

Este proyecto está bajo la Licencia ISC.
