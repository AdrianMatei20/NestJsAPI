import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';

import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { PublicIssueDto } from './dto/public-issue.dto';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';
import { RETURN_MESSAGES } from 'src/constants/return-messages';
import { Issue } from './entities/issue.entity';
import { IssueType } from './enums/issue-type';
import { IssueStatus } from './enums/issue-status';
import { IssuePriority } from './enums/issue-priority';

const USER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const ISSUE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const PROJECT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function buildIssue(): Issue {
  return {
    id: ISSUE_ID,
    title: 'Bug found',
    description: 'Something is broken.',
    type: IssueType.BUG,
    status: IssueStatus.TODO,
    priority: IssuePriority.MEDIUM,
    project: { id: PROJECT_ID } as any,
    reporter: null,
    assignee: null,
    labels: [],
    comments: [],
    dueDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('IssueController', () => {
  let issueController: IssueController;
  let mockIssueService: any;
  const req = { user: { id: USER_ID } };

  beforeEach(async () => {
    mockIssueService = {
      create: jest.fn().mockResolvedValue(buildIssue()),
      findAllByProjectId: jest.fn().mockResolvedValue([buildIssue()]),
      findOneById: jest.fn().mockResolvedValue(buildIssue()),
      update: jest.fn().mockResolvedValue(buildIssue()),
      remove: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IssueController],
      providers: [{ provide: IssueService, useValue: mockIssueService }],
    }).compile();

    issueController = module.get<IssueController>(IssueController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(issueController).toBeDefined();
  });

  it('create should delegate to the service and return 201', async () => {
    const dto = { projectId: PROJECT_ID, title: 'Bug found', description: 'Something is broken.' };
    const result: CustomMessageDto<PublicIssueDto> = await issueController.create(req, dto);

    expect(mockIssueService.create).toHaveBeenCalledWith(dto, USER_ID);
    expect(result.statusCode).toBe(HttpStatus.CREATED);
    expect(result.message).toBe(RETURN_MESSAGES.CREATED.ISSUE);
    expect(result.data.id).toBe(ISSUE_ID);
  });

  it('findAll should delegate to the service with the projectId query param', async () => {
    const result: CustomMessageDto<PublicIssueDto[]> = await issueController.findAll(req, PROJECT_ID);

    expect(mockIssueService.findAllByProjectId).toHaveBeenCalledWith(PROJECT_ID, USER_ID);
    expect(result.data).toHaveLength(1);
  });

  it('findAll should reject when projectId is missing', async () => {
    await expect(issueController.findAll(req, undefined)).rejects.toThrow(BadRequestException);
  });

  it('findOne should delegate to the service', async () => {
    const result: CustomMessageDto<PublicIssueDto> = await issueController.findOne(req, ISSUE_ID);

    expect(mockIssueService.findOneById).toHaveBeenCalledWith(ISSUE_ID, USER_ID);
    expect(result.message).toBe(RETURN_MESSAGES.OK.ISSUE_FOUND);
  });

  it('update should delegate to the service', async () => {
    const dto = { status: IssueStatus.IN_PROGRESS };
    const result: CustomMessageDto<PublicIssueDto> = await issueController.update(req, ISSUE_ID, dto);

    expect(mockIssueService.update).toHaveBeenCalledWith(ISSUE_ID, dto, USER_ID);
    expect(result.message).toBe(RETURN_MESSAGES.OK.ISSUE_UPDATED);
  });

  it('remove should delegate to the service and return a SimpleMessageDto', async () => {
    const result: SimpleMessageDto = await issueController.remove(req, ISSUE_ID);

    expect(mockIssueService.remove).toHaveBeenCalledWith(ISSUE_ID, USER_ID);
    expect(result).toEqual({ statusCode: HttpStatus.OK, message: RETURN_MESSAGES.OK.ISSUE_DELETED });
  });

});
