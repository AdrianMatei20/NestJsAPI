import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, HttpStatus, SetMetadata } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiExtraModels, ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { ProjectDto } from './dto/project.dto';
import { ProjectRoleGuard } from 'src/auth/guards/project-role.guard';
import { ProjectRole } from './enums/project-role';

@ApiTags('project')
@Controller('project')
@ApiExtraModels(CustomMessageDto, ProjectDto)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Post()
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Creates a new project.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'project created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid json or missing properties' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error' })
  create(
    @Req() req,
    @Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto, req.user.id);
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Returns the list of projects of a user.' })
  @ApiResponse({
    status: HttpStatus.OK, description: 'successful get', schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: '3 projects found' },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(ProjectDto) },
          example: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Project One',
              description: 'First project description.',
              createdAt: '2024-01-01T12:00:00Z',
              ownerId: '987e1234-b89b-12d3-a456-426614174999',
            },
            {
              id: '223e4567-e89b-12d3-a456-426614174001',
              name: 'Project Two',
              description: 'Second project description.',
              createdAt: '2024-02-01T12:00:00Z',
              ownerId: '987e1234-b89b-12d3-a456-426614174998',
            },
            {
              id: '323e4567-e89b-12d3-a456-426614174002',
              name: 'Project Three',
              description: 'Third project description.',
              createdAt: '2024-03-01T12:00:00Z',
              ownerId: '987e1234-b89b-12d3-a456-426614174997',
            },
          ],
        },
      },
    }
  })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error' })
  findAll(@Req() req) {
    return this.projectService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Returns the project with the provided id.' })
  @ApiResponse({
    status: HttpStatus.OK, description: 'successful get', schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'project found' },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(ProjectDto) },
          example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Project One',
            description: 'First project description.',
            createdAt: '2024-01-01T12:00:00Z',
            ownerId: '987e1234-b89b-12d3-a456-426614174999',
          }
        },
      },
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid project id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'project not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error' })
  findOne(@Param('id') id: string) {
    return this.projectService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(AuthenticatedGuard)
  @SetMetadata('projectRoles', [ProjectRole.OWNER, ProjectRole.ADMIN])
  @UseGuards(ProjectRoleGuard)
  @ApiOperation({ summary: 'Updates the project with the provided id.' })
  @ApiResponse({
    status: HttpStatus.OK, description: 'successful update', schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: '3 projects found' },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(ProjectDto) },
          example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Project One',
            description: 'First project description.',
            createdAt: '2024-01-01T12:00:00Z',
            ownerId: '987e1234-b89b-12d3-a456-426614174999',
          }
        },
      },
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid project id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'project not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Deletes the project with the provided id.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful delete' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid project id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'project not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error' })
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
