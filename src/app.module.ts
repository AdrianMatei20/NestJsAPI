import { Module, Session } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './resources/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { EmailService } from './services/email/email.service';
import { TokenService } from './services/token/token.service';
import { JwtService } from '@nestjs/jwt';
import { ProjectModule } from './resources/project/project.module';
import { SeedService } from './services/seed/seed.service';
import { User } from './resources/user/entities/user.entity';
import { Project } from './resources/project/entities/project.entity';
import { UserProjectRole } from './resources/project/entities/user-project-role.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({
      session: true,
    }),
    AuthModule,
    UserModule,
    ProjectModule,
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
    TypeOrmModule.forFeature([User, Project, UserProjectRole])
  ],
  controllers: [AppController],
  providers: [AppService, EmailService, TokenService, JwtService, SeedService],
})
export class AppModule {

  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.seed();
  }

}
