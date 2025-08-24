import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser'; // Import cookie-parser

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend applications (adjust origin as needed for production)
  // IMPORTANT: For security, replace 'http://localhost:3000' with your actual frontend URL in production.
  app.enableCors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent with requests (crucial for HttpOnly cookies)
  });

  // Use ValidationPipe globally for DTO validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips properties that are not whitelisted in DTOs (removes unknown properties)
    forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are present in the payload
    transform: true, // Automatically transforms payloads to DTO instances
  }));

  // Enable cookie-parser middleware
  app.use(cookieParser());

  // Set global prefix for all API routes if desired, e.g., /api
  // app.setGlobalPrefix('api');

  await app.listen(3000); // Listen on port 3000
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
