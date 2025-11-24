import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 설정 서비스 가져오기
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 5000);
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');
  
  // 전역 파이프 설정 (검증용)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // CORS 설정
  app.use(cors({
    origin: corsOrigin,
    credentials: true,
  }));
  
  // API 접두어 설정
  app.setGlobalPrefix('api');
  
  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('KJ Commerce WMS API')
    .setDescription('KJ Commerce WMS API Documentation')
    .setVersion('1.0')
    .addTag('wms')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}

bootstrap();