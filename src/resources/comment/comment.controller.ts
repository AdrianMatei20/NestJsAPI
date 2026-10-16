import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, HttpStatus, Query, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PublicCommentDto } from './dto/public-comment.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';
import { Comment } from './entities/comment.entity';
import { RETURN_MESSAGES } from 'src/constants/return-messages';

@ApiTags('comment')
@Controller('comment')
@UseGuards(AuthenticatedGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  @Post()
  @ApiOperation({ summary: 'Creates a new comment on an issue.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'comment created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid json or missing properties' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'not a member of this project' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'issue not found' })
  async create(@Req() req, @Body() createCommentDto: CreateCommentDto): Promise<CustomMessageDto<PublicCommentDto>> {
    const comment: Comment = await this.commentService.create(createCommentDto, req.user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: RETURN_MESSAGES.CREATED.COMMENT,
      data: new PublicCommentDto(comment),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Returns the list of comments for an issue.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful get' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'missing or invalid issueId query param' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'not a member of this project' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'issue not found' })
  async findAll(@Req() req, @Query('issueId') issueId: string): Promise<CustomMessageDto<PublicCommentDto[]>> {
    if (!issueId) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: RETURN_MESSAGES.BAD_REQUEST.INVALID_ISSUE_ID,
      });
    }

    const comments: Comment[] = await this.commentService.findAllByIssueId(issueId, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: RETURN_MESSAGES.OK.N_COMMENTS_FOUND(comments.length),
      data: comments.map(comment => new PublicCommentDto(comment)),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates the comment with the provided id.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful update' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid comment id or missing body' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'not the comment\'s author or a project owner/admin' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'comment not found' })
  async update(@Req() req, @Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto): Promise<CustomMessageDto<PublicCommentDto>> {
    const comment: Comment = await this.commentService.update(id, updateCommentDto, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: RETURN_MESSAGES.OK.COMMENT_UPDATED,
      data: new PublicCommentDto(comment),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes the comment with the provided id.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful delete' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid comment id' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'not the comment\'s author or a project owner/admin' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'comment not found' })
  async remove(@Req() req, @Param('id') id: string): Promise<SimpleMessageDto> {
    await this.commentService.remove(id, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: RETURN_MESSAGES.OK.COMMENT_DELETED,
    };
  }
}
