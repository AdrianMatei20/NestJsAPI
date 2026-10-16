import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, HttpStatus, Query, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LabelService } from './label.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { PublicLabelDto } from './dto/public-label.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';
import { Label } from './entities/label.entity';
import { RETURN_MESSAGES } from 'src/constants/return-messages';

@ApiTags('label')
@Controller('label')
@UseGuards(AuthenticatedGuard)
export class LabelController {
  constructor(private readonly labelService: LabelService) { }

  @Post()
  @ApiOperation({ summary: 'Creates a new label on a project.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'label created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid json or missing properties' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'insufficient project role' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'project not found' })
  async create(@Req() req, @Body() createLabelDto: CreateLabelDto): Promise<CustomMessageDto<PublicLabelDto>> {
    const label: Label = await this.labelService.create(createLabelDto, req.user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: RETURN_MESSAGES.CREATED.LABEL,
      data: new PublicLabelDto(label),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Returns the list of labels for a project.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful get' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'missing or invalid projectId query param' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'not a member of this project' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'project not found' })
  async findAll(@Req() req, @Query('projectId') projectId: string): Promise<CustomMessageDto<PublicLabelDto[]>> {
    if (!projectId) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: RETURN_MESSAGES.BAD_REQUEST.INVALID_PROJECT_ID,
      });
    }

    const labels: Label[] = await this.labelService.findAllByProjectId(projectId, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: RETURN_MESSAGES.OK.N_LABELS_FOUND(labels.length),
      data: labels.map(label => new PublicLabelDto(label)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns the label with the provided id.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful get' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid label id' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'not a member of this project' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'label not found' })
  async findOne(@Req() req, @Param('id') id: string): Promise<CustomMessageDto<PublicLabelDto>> {
    const label: Label = await this.labelService.findOneById(id, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: RETURN_MESSAGES.OK.LABEL_FOUND,
      data: new PublicLabelDto(label),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates the label with the provided id.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful update' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid label id' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'insufficient project role' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'label not found' })
  async update(@Req() req, @Param('id') id: string, @Body() updateLabelDto: UpdateLabelDto): Promise<CustomMessageDto<PublicLabelDto>> {
    const label: Label = await this.labelService.update(id, updateLabelDto, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: RETURN_MESSAGES.OK.LABEL_UPDATED,
      data: new PublicLabelDto(label),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes the label with the provided id.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful delete' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid label id' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'insufficient project role' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'label not found' })
  async remove(@Req() req, @Param('id') id: string): Promise<SimpleMessageDto> {
    await this.labelService.remove(id, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: RETURN_MESSAGES.OK.LABEL_DELETED,
    };
  }
}
