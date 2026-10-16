import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';

import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { PublicCommentDto } from './dto/public-comment.dto';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';
import { RETURN_MESSAGES } from 'src/constants/return-messages';
import { Comment } from './entities/comment.entity';

const USER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const COMMENT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ISSUE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function buildComment(): Comment {
  return {
    id: COMMENT_ID,
    body: 'This is a comment.',
    issue: { id: ISSUE_ID } as any,
    author: { id: USER_ID } as any,
    createdAt: new Date(),
  };
}

describe('CommentController', () => {
  let commentController: CommentController;
  let mockCommentService: any;
  const req = { user: { id: USER_ID } };

  beforeEach(async () => {
    mockCommentService = {
      create: jest.fn().mockResolvedValue(buildComment()),
      findAllByIssueId: jest.fn().mockResolvedValue([buildComment()]),
      update: jest.fn().mockResolvedValue(buildComment()),
      remove: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [{ provide: CommentService, useValue: mockCommentService }],
    }).compile();

    commentController = module.get<CommentController>(CommentController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(commentController).toBeDefined();
  });

  it('create should delegate to the service and return 201', async () => {
    const dto = { issueId: ISSUE_ID, body: 'This is a comment.' };
    const result: CustomMessageDto<PublicCommentDto> = await commentController.create(req, dto);

    expect(mockCommentService.create).toHaveBeenCalledWith(dto, USER_ID);
    expect(result.statusCode).toBe(HttpStatus.CREATED);
    expect(result.message).toBe(RETURN_MESSAGES.CREATED.COMMENT);
  });

  it('findAll should reject when issueId is missing', async () => {
    await expect(commentController.findAll(req, undefined)).rejects.toThrow(BadRequestException);
  });

  it('findAll should delegate to the service with the issueId query param', async () => {
    const result: CustomMessageDto<PublicCommentDto[]> = await commentController.findAll(req, ISSUE_ID);

    expect(mockCommentService.findAllByIssueId).toHaveBeenCalledWith(ISSUE_ID, USER_ID);
    expect(result.data).toHaveLength(1);
  });

  it('update should delegate to the service', async () => {
    const dto = { body: 'Edited.' };
    const result: CustomMessageDto<PublicCommentDto> = await commentController.update(req, COMMENT_ID, dto);
    expect(mockCommentService.update).toHaveBeenCalledWith(COMMENT_ID, dto, USER_ID);
    expect(result.message).toBe(RETURN_MESSAGES.OK.COMMENT_UPDATED);
  });

  it('remove should delegate to the service and return a SimpleMessageDto', async () => {
    const result: SimpleMessageDto = await commentController.remove(req, COMMENT_ID);
    expect(mockCommentService.remove).toHaveBeenCalledWith(COMMENT_ID, USER_ID);
    expect(result).toEqual({ statusCode: HttpStatus.OK, message: RETURN_MESSAGES.OK.COMMENT_DELETED });
  });

});
