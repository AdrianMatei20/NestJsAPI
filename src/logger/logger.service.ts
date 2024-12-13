import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LoggerService {

  constructor(
    @InjectRepository(Log) private readonly logRepository: Repository<Log>,
  ) { }

  async error(message: string, context: string, trace: string, metadata?: any): Promise<void> {
    try {
      await this.logRepository.save({ level: 'ERROR', message, context, metadata, trace, timestamp: new Date() });
    } catch (error) {
      console.error(`Failed to save log: ${error.message}`);
    }
  }

  async warn(message: string, context: string, metadata?: any): Promise<void> {
    try {
      await this.logRepository.save({ level: 'WARN', message, context, metadata, timestamp: new Date() });
    } catch (error) {
      console.error(`Failed to save log: ${error.message}`);
    }
  }

  async info(message: string, context: string, metadata?: any): Promise<void> {
    try {
      await this.logRepository.save({ level: 'INFO', message, context, metadata, timestamp: new Date() });
    } catch (error) {
      console.error(`Failed to save log: ${error.message}`);
    }
  }

  async debug(message: string, context: string, metadata?: any): Promise<void> {
    try {
      await this.logRepository.save({ level: 'DEBUG', message, context, metadata, timestamp: new Date() });
    } catch (error) {
      console.error(`Failed to save log: ${error.message}`);
    }
  }

  async getLogs(): Promise<Log[]> {
    try {
      return await this.logRepository.find({ order: { timestamp: 'DESC' } });
    } catch (error) {
      console.error(`Failed to save log: ${error.message}`);
    }
  }
}
