import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Odpalamy walidację globalną dla DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // Dodajemy prefiks globalny dla wszystkich ścieżek
  app.setGlobalPrefix('api');
  await app.listen(3000);
  console.log(`KKBus Backend is running on port 3000`);
}
bootstrap();
