import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import session from 'express-session';
import * as passport from 'passport';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  dotenv.config();

  const NUMBER_OF_HOURS: number = 3;

  // Initialize sessions
  app.use(
    session({
      name: 'SESSION_ID',
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        maxAge: NUMBER_OF_HOURS * 60 * 60 * 1000,
      },
    })
  );

  // Initialize passport
  const passport = require('passport');
  const LocalStrategy = require('passport-local').Strategy;
  app.use(passport.initialize());
  app.use(passport.session());

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('nestjs api')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();
