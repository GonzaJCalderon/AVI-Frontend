# Configuración de JWT en la aplicación FAV

## Instalación y Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT
JWT_SECRET="tu-secreto-super-seguro-cambiar-en-produccion"
JWT_EXPIRES_IN="24h"

# App
PORT=3000
NODE_ENV=development
```

### 2. Migración de Base de Datos

Ejecuta la migración para crear la tabla de usuarios:

```bash
npm run prisma:migrate
```

### 3. Generar Cliente Prisma

```bash
npm run prisma:generate
```

### 4. Crear Usuario Administrador

```bash
npm run create:admin
```

Esto creará un usuario administrador con las siguientes credenciales:

- Email: admin@fav.com
- Password: admin123
- Rol: admin

## Endpoints de Autenticación

### POST /auth/register

Registra un nuevo usuario.

**Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "nombre": "Juan Pérez",
  "rol": "usuario"
}
```

### POST /auth/login

Inicia sesión y obtiene un token JWT.

**Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez",
    "rol": "usuario"
  }
}
```

### GET /auth/profile

Obtiene el perfil del usuario autenticado (requiere token JWT).

**Headers:**

```
Authorization: Bearer <token>
```

## Protección de Rutas

Todas las rutas de `/intervenciones` ahora requieren autenticación JWT.

Para usar las rutas protegidas, incluye el token en el header:

```
Authorization: Bearer <tu-token-jwt>
```

## Estructura de Usuarios

### Modelo Usuario

- `id`: ID único del usuario
- `email`: Email único del usuario
- `password`: Contraseña hasheada
- `nombre`: Nombre completo del usuario
- `rol`: Rol del usuario (usuario, admin, etc.)
- `activo`: Estado del usuario
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

### Roles Disponibles

- `usuario`: Usuario estándar
- `admin`: Administrador con todos los permisos

## Seguridad

1. **Contraseñas**: Se hashean usando bcrypt con salt de 10 rondas
2. **Tokens JWT**: Expiran en 24 horas por defecto
3. **Secreto JWT**: Cambia el secreto en producción
4. **Validación**: Se valida email y longitud mínima de contraseña

## Desarrollo

Para desarrollo local, puedes usar las credenciales del administrador:

- Email: admin@fav.com
- Password: admin123

## Producción

En producción, asegúrate de:

1. Cambiar el `JWT_SECRET` por un secreto fuerte y único
2. Configurar variables de entorno apropiadas
3. Usar HTTPS
4. Implementar rate limiting
5. Configurar CORS apropiadamente
