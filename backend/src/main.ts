import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Enforce strong JWT secret in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error(
        'ERREUR SÉCURITÉ: La variable JWT_SECRET doit être définie avec au moins 32 caractères aléatoires en production.',
      );
    }
  }

  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Security HTTP Headers with Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows uploads/images to be loaded by web & mobile
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Strict CORS policy
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow mobile apps, Postman, server-to-server or requests without origin header
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some(
        (allowed) => origin === allowed || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'),
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`Requête bloquée par CORS pour l'origine: ${origin}`);
        callback(new Error('Origine non autorisée par la politique CORS'));
      }
    },
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.log(`JobConnect Backend API is running on http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Fatal error during backend bootstrap:', err);
});
