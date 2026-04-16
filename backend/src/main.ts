import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Odpalamy walidację globalną dla DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // Włączamy CORS bo studencki port 3000 gryzie się z frontem
  app.enableCors();
  
  await app.listen(3000);
  console.log(`Prowizorka na porcie 3000 wstała! KKBus czeka.`);
}
bootstrap();
