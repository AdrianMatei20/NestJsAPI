import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { LoggerModule } from 'src/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { UserProjectRole } from './entities/user-project-role.entity';
import { Log } from 'src/logger/entities/log.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ObjectValidationService } from 'src/services/object-validation/object-validation.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  imports: [UserModule, LoggerModule, TypeOrmModule.forFeature([Project, UserProjectRole, Log])],
  controllers: [ProjectController],
  providers: [ProjectService, ObjectValidationService, LoggerService],
  exports: [ProjectService],
})
export class ProjectModule {}
