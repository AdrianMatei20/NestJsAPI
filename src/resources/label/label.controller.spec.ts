import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';

import { LabelController } from './label.controller';
import { LabelService } from './label.service';
import { PublicLabelDto } from './dto/public-label.dto';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';
import { RETURN_MESSAGES } from 'src/constants/return-messages';
import { Label } from './entities/label.entity';

const USER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const LABEL_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const PROJECT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function buildLabel(): Label {
  return {
    id: LABEL_ID,
    name: 'frontend',
    color: '#3b82f6',
    project: { id: PROJECT_ID } as any,
    issues: [],
    createdAt: new Date(),
  };
}

describe('LabelController', () => {
  let labelController: LabelController;
  let mockLabelService: any;
  const req = { user: { id: USER_ID } };

  beforeEach(async () => {
    mockLabelService = {
      create: jest.fn().mockResolvedValue(buildLabel()),
      findAllByProjectId: jest.fn().mockResolvedValue([buildLabel()]),
      findOneById: jest.fn().mockResolvedValue(buildLabel()),
      update: jest.fn().mockResolvedValue(buildLabel()),
      remove: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelController],
      providers: [{ provide: LabelService, useValue: mockLabelService }],
    }).compile();

    labelController = module.get<LabelController>(LabelController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(labelController).toBeDefined();
  });

  it('create should delegate to the service and return 201', async () => {
    const dto = { projectId: PROJECT_ID, name: 'frontend', color: '#3b82f6' };
    const result: CustomMessageDto<PublicLabelDto> = await labelController.create(req, dto);

    expect(mockLabelService.create).toHaveBeenCalledWith(dto, USER_ID);
    expect(result.statusCode).toBe(HttpStatus.CREATED);
    expect(result.message).toBe(RETURN_MESSAGES.CREATED.LABEL);
  });

  it('findAll should reject when projectId is missing', async () => {
    await expect(labelController.findAll(req, undefined)).rejects.toThrow(BadRequestException);
  });

  it('findAll should delegate to the service with the projectId query param', async () => {
    const result: CustomMessageDto<PublicLabelDto[]> = await labelController.findAll(req, PROJECT_ID);

    expect(mockLabelService.findAllByProjectId).toHaveBeenCalledWith(PROJECT_ID, USER_ID);
    expect(result.data).toHaveLength(1);
  });

  it('findOne should delegate to the service', async () => {
    const result: CustomMessageDto<PublicLabelDto> = await labelController.findOne(req, LABEL_ID);
    expect(mockLabelService.findOneById).toHaveBeenCalledWith(LABEL_ID, USER_ID);
    expect(result.message).toBe(RETURN_MESSAGES.OK.LABEL_FOUND);
  });

  it('update should delegate to the service', async () => {
    const dto = { name: 'backend' };
    const result: CustomMessageDto<PublicLabelDto> = await labelController.update(req, LABEL_ID, dto);
    expect(mockLabelService.update).toHaveBeenCalledWith(LABEL_ID, dto, USER_ID);
    expect(result.message).toBe(RETURN_MESSAGES.OK.LABEL_UPDATED);
  });

  it('remove should delegate to the service and return a SimpleMessageDto', async () => {
    const result: SimpleMessageDto = await labelController.remove(req, LABEL_ID);
    expect(mockLabelService.remove).toHaveBeenCalledWith(LABEL_ID, USER_ID);
    expect(result).toEqual({ statusCode: HttpStatus.OK, message: RETURN_MESSAGES.OK.LABEL_DELETED });
  });

});
