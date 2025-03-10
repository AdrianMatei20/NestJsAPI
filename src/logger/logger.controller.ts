import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { GlobalAdminGuard } from 'src/auth/guards/global-admin.guard';
import { Log } from './entities/log.entity';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';

@ApiTags('logger')
@Controller('logger')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) { }

  @Get()
  @UseGuards(AuthenticatedGuard)
  @UseGuards(GlobalAdminGuard)
  @ApiOperation({ summary: 'Returns a list of logs.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'successful get' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'user is not logged in or is not an admin' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error' })
  async findAll(
    @Query('level') level?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<CustomMessageDto<Log[]>> {

    let logs: Log[] = await this.loggerService.getLogs({ level, fromDate, toDate, sortBy, order });

    return {
      statusCode: HttpStatus.OK,
      message: `${logs.length} log${logs.length === 1 ? '' : 's'} found`,
      data: logs,
    }

  }
}
