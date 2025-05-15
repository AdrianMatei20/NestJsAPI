import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './resources/project/project.module';
import { UserModule } from './resources/user/user.module';
import { LoggerModule } from './logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './resources/user/entities/user.entity';
import { Project } from './resources/project/entities/project.entity';
import { UserProjectRole } from './resources/project/entities/user-project-role.entity';
import { Log } from './logger/entities/log.entity';
import { ResetPassword } from './auth/reset-password/reset-password.entity';

import { EmailService } from './services/email/email.service';
import { TokenService } from './services/token/token.service';
import { JwtService } from '@nestjs/jwt';
import { SeedService } from './services/seed/seed.service';
import { ObjectValidationService } from './services/object-validation/object-validation.service';
import { LoggerService } from './logger/logger.service';
import { AuthService } from './auth/auth.service';
import { ResetPasswordService } from './auth/reset-password/reset-password.service';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { HelloResolver } from './graphql/hello/hello.resolver';
import { ProjectResolver } from './graphql/project/project.resolver';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      isGlobal: true,
    }),
    PassportModule.register({
      session: true,
    }),
    HealthModule,
    AuthModule,
    ProjectModule,
    UserModule,
    LoggerModule,
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Project, UserProjectRole, Log, ResetPassword]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // auto-generate
      sortSchema: true,
      playground: true, // enable GraphQL playground
      introspection: true, // explicitly allow introspection
      context: ({ req }) => ({ req }), // attaches user to context
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EmailService,
    TokenService,
    JwtService,
    SeedService,
    ObjectValidationService,
    LoggerService,
    AuthService,
    ResetPasswordService,
    HelloResolver,
    ProjectResolver,
  ],
})
export class AppModule {

  constructor(private readonly seedService: SeedService) { }

  async onModuleInit() {
    await this.seedService.seed();
  }

}
