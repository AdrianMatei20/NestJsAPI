import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { UserModule } from '../user/user.module';
import { ObjectValidationService } from 'src/services/object-validation.service';
import { UserProjectRole } from './entities/user-project-role.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Project, UserProjectRole])],
  controllers: [ProjectController],
  providers: [ProjectService, ObjectValidationService],
})
export class ProjectModule {}
