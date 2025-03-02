import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Project } from '../project/entities/project.entity';
import { Log } from 'src/logger/entities/log.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, Log])],
  controllers: [UserController],
  providers: [UserService, LoggerService],
  exports: [UserService],
})
export class UserModule { }
