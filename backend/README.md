# API del Sistema de Asistencia a Víctimas (FAV)

API RESTful construida con [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/) y [PostgreSQL](https://www.postgresql.org/) para gestionar las intervenciones y el seguimiento de víctimas de delitos.

## Características

-   Autenticación basada en JWT (Access & Refresh Tokens).
-   Gestión completa de Intervenciones (CRUD).
-   Manejo de estados para intervenciones (activa, cerrada, archivada, eliminada).
-   Roles de usuario (admin, usuario).
-   Validación de datos de entrada con `class-validator`.
-   Documentación de API autogenerada con Swagger (OpenAPI).

## Requisitos Previos

-   Node.js (v20 o superior recomendado)
-   npm o yarn
-   PostgreSQL

## Configuración del Proyecto

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd fav
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto. Puedes basarte en el archivo `JWT_SETUP.md` para las variables necesarias.

    ```env
    # Base de Datos
    DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/NOMBRE_BD"

    # JWT
    JWT_SECRET="tu-secreto-super-seguro-cambiar-en-produccion"
    JWT_EXPIRES_IN="1h"
    REFRESH_TOKEN_SECRET="tu-otro-secreto-super-seguro"
    REFRESH_TOKEN_EXPIRES_IN="7d"

    # Aplicación
    PORT=3000
    NODE_ENV=development
    ```

4.  **Configuración de la Base de Datos:**
    Ejecuta las migraciones de Prisma para crear las tablas en tu base de datos.
    ```bash
    npm run prisma:migrate
    ```

5.  **Generar el cliente de Prisma:**
    ```bash
    npm run prisma:generate
    ```

6.  **(Opcional) Crear usuario administrador:**
    El proyecto incluye un script para crear un usuario administrador por defecto.
    ```bash
    npm run create:admin
    ```
    Esto creará un usuario con las siguientes credenciales:
    -   **Email:** `admin@fav.com`
    -   **Contraseña:** `admin123`

## Ejecutar la Aplicación

```bash
# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
