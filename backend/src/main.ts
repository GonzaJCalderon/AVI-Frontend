// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS para permitir peticiones del frontend
  app.enableCors({
    origin: true, // O especifica tu dominio: 'http://localhost:3000'
    credentials: true,
  });

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Solo permite propiedades definidas en DTOs
      forbidNonWhitelisted: true, // Rechaza propiedades no definidas
      transform: true, // Transforma automáticamente tipos
      transformOptions: {
        enableImplicitConversion: true, // Convierte strings a números automáticamente
      },
    }),
  );

  // Configurar prefijo global de la API
  app.setGlobalPrefix('api');

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('FAV API')
    .setDescription('API para el sistema FAV (Asistencia a Victimas de Delitos')
    .setVersion('1.0')
    .addTag('intervenciones', 'Endpoints relacionados con intervenciones')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📚 API disponible en http://localhost:${port}/api`);
  console.log(`📖 Documentación Swagger en http://localhost:${port}/api/docs`);
}
bootstrap();
