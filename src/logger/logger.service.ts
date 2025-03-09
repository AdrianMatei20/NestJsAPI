import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';

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

  async getLogs(filters: { level?: string; fromDate?: string; toDate?: string; sortBy?: string; order: 'ASC' | 'DESC' }): Promise<Log[]> {
    try {

      const query = await this.logRepository.createQueryBuilder('log');

      if (filters.level) {
        query.andWhere('log.level = :level', { level: filters.level });
      }

      if (filters.fromDate && filters.toDate) {
        query.andWhere('log.timestamp BETWEEN :fromDate AND :toDate', { fromDate: filters.fromDate, toDate: filters.toDate });
      }

      if (filters.sortBy) {
        query.orderBy(`log.${filters.sortBy}`, filters.order);
      } else {
        query.orderBy('log.timestamp', filters.order);
      }

      return await query.getMany();

    } catch (error) {
      console.error(`Failed to fetch logs: ${error.message}`);
    }
  }
}
