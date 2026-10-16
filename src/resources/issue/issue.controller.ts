import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, HttpStatus, Query, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IssueService } from './issue.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { PublicIssueDto } from './dto/public-issue.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';
import { Issue } from './entities/issue.entity';
import { RETURN_MESSAGES } from 'src/constants/return-messages';

@ApiTags('issue')
@Controller('issue')
@UseGuards(AuthenticatedGuard)
export class IssueController {
  constructor(private readonly issueService: IssueService) { }

  @Post()
  @ApiOperation({ summary: 'Creates a new issue on a project.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'issue created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid json, missing properties or invalid assignee id' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'insufficient project role' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'project not found' })
  async create(@Req() req, @Body() createIssueDto: CreateIssueDto): Promise<CustomMessageDto<PublicIssueDto>> {
    const issue: Issue = await this.issueService.create(createIssueDto, req.user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: RETURN_MESSAGES.CREATED.ISSUE,
      data: new PublicIssueDto(issue),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Returns the list of issues for a project.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful get' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'missing or invalid projectId query param' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'not a member of this project' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'project not found' })
  async findAll(@Req() req, @Query('projectId') projectId: string): Promise<CustomMessageDto<PublicIssueDto[]>> {
    if (!projectId) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: RETURN_MESSAGES.BAD_REQUEST.INVALID_PROJECT_ID,
      });
    }

    const issues: Issue[] = await this.issueService.findAllByProjectId(projectId, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: RETURN_MESSAGES.OK.N_ISSUES_FOUND(issues.length),
      data: issues.map(issue => new PublicIssueDto(issue)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns the issue with the provided id.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful get' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid issue id' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'not a member of this project' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'issue not found' })
  async findOne(@Req() req, @Param('id') id: string): Promise<CustomMessageDto<PublicIssueDto>> {
    const issue: Issue = await this.issueService.findOneById(id, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: RETURN_MESSAGES.OK.ISSUE_FOUND,
      data: new PublicIssueDto(issue),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates the issue with the provided id.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful update' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid issue id or invalid assignee id' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'insufficient project role' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'issue not found' })
  async update(@Req() req, @Param('id') id: string, @Body() updateIssueDto: UpdateIssueDto): Promise<CustomMessageDto<PublicIssueDto>> {
    const issue: Issue = await this.issueService.update(id, updateIssueDto, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: RETURN_MESSAGES.OK.ISSUE_UPDATED,
      data: new PublicIssueDto(issue),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes the issue with the provided id.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful delete' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid issue id' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'insufficient project role' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'issue not found' })
  async remove(@Req() req, @Param('id') id: string): Promise<SimpleMessageDto> {
    await this.issueService.remove(id, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: RETURN_MESSAGES.OK.ISSUE_DELETED,
    };
  }
}
