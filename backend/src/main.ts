import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Odpalamy walidację globalną dla DTO z transformacją typów
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // Rejestrujemy globalny filtr wyjątków
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Dodajemy prefiks globalny dla wszystkich ścieżek
  app.setGlobalPrefix('api');
  
  // Włączamy CORS dla żądań z frontendu
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:4040', 'http://localhost'],
    credentials: true,
  });
  
  await app.listen(3000);
  console.log(`KKBus Backend is running on port 3000`);
}
bootstrap();
