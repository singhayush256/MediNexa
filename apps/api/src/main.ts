import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global DTO validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Set global API prefix to /api/v1
  app.setGlobalPrefix('api/v1');

  // Enable CORS for frontend integration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 MediNexa API backend running on http://localhost:${port}/api/v1`);
  console.log(`🏥 Health check endpoint: http://localhost:${port}/api/v1/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${port}/api/v1/auth/register | login | me`);
}
bootstrap();
