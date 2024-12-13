import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('logs')
export class Log {

  @PrimaryGeneratedColumn("uuid")
  readonly id: string;

  @Column()
  level: string; // e.g., 'info', 'error', 'warn'

  @Column()
  message: string;

  @Column()
  context: string; // e.g., which module or service

  @Column({ type: 'json', nullable: true })
  metadata?: any; // Additional information

  @Column({ nullable: true })
  trace?: string; // stack trace for errors

  @CreateDateColumn()
  timestamp: Date;

}