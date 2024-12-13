export interface ILogger {
    log(message: string): Promise<void>;
    error(message: string, trace?: string): Promise<void>;
    warn(message: string): Promise<void>;
    debug(message: string): Promise<void>;
    verbose(message: string): Promise<void>;
  }