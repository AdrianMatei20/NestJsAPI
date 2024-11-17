import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Project])],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
