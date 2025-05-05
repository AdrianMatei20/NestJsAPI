import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, HttpStatus, SetMetadata, ForbiddenException } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiExtraModels, ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { PublicProjectDto } from './dto/public-project.dto';
import { ProjectRoleGuard } from 'src/auth/guards/project-role.guard';
import { ProjectRole } from './enums/project-role';
import { Project } from './entities/project.entity';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';
import { GlobalRole } from '../user/enums/global-role';
import { RETURN_MESSAGES } from 'src/constants/return-messages';

@ApiTags('project')
@Controller('project')
@ApiExtraModels(CustomMessageDto, PublicProjectDto)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Post()
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Creates a new project.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'project created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid json or missing properties' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'user not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error' })
  async create(
    @Req() req,
    @Body() createProjectDto: CreateProjectDto
  ): Promise<CustomMessageDto<Project | PublicProjectDto> | SimpleMessageDto> {
    const project: Project = await this.projectService.create(createProjectDto, req.user.id);

    switch (req.user.globalRole) {

      case (GlobalRole.ADMIN): {
        return {
          statusCode: HttpStatus.CREATED,
          message: RETURN_MESSAGES.CREATED.PROJECT,
          data: new PublicProjectDto(project),
        }
      }

      case (GlobalRole.REGULAR_USER): {
        return {
          statusCode: HttpStatus.CREATED,
          message: RETURN_MESSAGES.CREATED.PROJECT,
          data: new PublicProjectDto(project),
        }
      }

      default: {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
        });
      }

    }
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Returns the list of projects of a user.' })
  @ApiResponse({
    status: HttpStatus.OK, description: 'successful get', schema: {
      properties: {
        statusCode: { type: 'number', example: HttpStatus.OK },
        message: { type: 'string', example: '3 projects found' },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(PublicProjectDto) },
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
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid user id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'user not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error' })
  async findAll(@Req() req): Promise<CustomMessageDto<Project[] | PublicProjectDto[]>> {
    switch (req.user.globalRole) {

      case (GlobalRole.ADMIN): {
        const projects: Project[] = await this.projectService.findAll();
        return {
          statusCode: HttpStatus.OK,
          message: RETURN_MESSAGES.OK.N_PROJECTS_FOUND(projects.length),
          data: projects.map(project => new PublicProjectDto(project)),
        }
      }

      case (GlobalRole.REGULAR_USER): {
        const projects: Project[] = await this.projectService.findAllByUserId(req.user.id);
        return {
          statusCode: HttpStatus.OK,
          message: RETURN_MESSAGES.OK.N_PROJECTS_FOUND(projects.length),
          data: projects.map(project => new PublicProjectDto(project)),
        }
      }

      default: {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
        });
      }

    }
  }

  @Get(':id')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(ProjectRoleGuard)
  @ApiOperation({ summary: 'Returns the project with the provided id.' })
  @ApiResponse({
    status: HttpStatus.OK, description: 'successful get', schema: {
      properties: {
        statusCode: { type: 'number', example: HttpStatus.OK },
        message: { type: 'string', example: 'project found' },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(PublicProjectDto) },
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
  async findOne(@Req() req, @Param('id') id: string): Promise<CustomMessageDto<Project | PublicProjectDto>> {
    const project: Project = await this.projectService.findOneById(id);

    switch (req.user.globalRole) {

      case (GlobalRole.ADMIN): {
        return {
          statusCode: HttpStatus.OK,
          message: RETURN_MESSAGES.OK.PROJECT_FOUND,
          data: new PublicProjectDto(project),
        }
      }

      case (GlobalRole.REGULAR_USER): {
        return {
          statusCode: HttpStatus.OK,
          message: RETURN_MESSAGES.OK.PROJECT_FOUND,
          data: new PublicProjectDto(project),
        }
      }

      default: {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
        });
      }

    }
  }

  @Patch(':id')
  @UseGuards(AuthenticatedGuard)
  @SetMetadata('projectRoles', [ProjectRole.OWNER, ProjectRole.ADMIN])
  @UseGuards(ProjectRoleGuard)
  @ApiOperation({ summary: 'Updates the project with the provided id.' })
  @ApiResponse({
    status: HttpStatus.OK, description: 'successful update', schema: {
      properties: {
        statusCode: { type: 'number', example: HttpStatus.OK },
        message: { type: 'string', example: '3 projects found' },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(PublicProjectDto) },
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
  async update(
    @Req() req,
    @Param('id') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<CustomMessageDto<Project | PublicProjectDto>> {
    const updatedProject: Project = await this.projectService.update(projectId, updateProjectDto);

    switch (req.user.globalRole) {

      case (GlobalRole.ADMIN): {
        return {
          statusCode: HttpStatus.OK,
          message: RETURN_MESSAGES.OK.PROJECT_UPDATED,
          data: updatedProject,
        }
      }

      case (GlobalRole.REGULAR_USER): {
        return {
          statusCode: HttpStatus.OK,
          message: RETURN_MESSAGES.OK.PROJECT_UPDATED,
          data: new PublicProjectDto(updatedProject),
        }
      }

      default: {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
        });
      }

    }
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  @SetMetadata('projectRoles', [ProjectRole.OWNER, ProjectRole.ADMIN])
  @UseGuards(ProjectRoleGuard)
  @ApiOperation({ summary: 'Deletes the project with the provided id.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful delete' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid project id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'project not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error' })
  async remove(@Param('id') id: string): Promise<SimpleMessageDto> {
    if (await this.projectService.remove(id)) {
      return {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.PROJECT_DELETED,
      }
    }
  }
}
