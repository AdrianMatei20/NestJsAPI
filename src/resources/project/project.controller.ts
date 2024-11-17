import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(
    @Req() req,
    @Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto, req.user.id);
  }

  @Get()
  findAll(@Req() req) {
    return this.projectService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
