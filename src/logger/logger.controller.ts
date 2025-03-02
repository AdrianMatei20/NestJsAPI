import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { GlobalAdminGuard } from 'src/auth/guards/global-admin.guard';

@ApiTags('logger')
@Controller('logger')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) { }

  @Get()
  @UseGuards(AuthenticatedGuard)
  @UseGuards(GlobalAdminGuard)
  findAll() {
    return this.loggerService.getLogs();
  }
}
