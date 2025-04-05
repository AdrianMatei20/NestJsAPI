import 'jest';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'test' | 'development' | 'production';
    }
  }

  export enum GlobalRole {
    UNKNOWN_ROLE = 'UNKNOWN_ROLE' // Allow in tests
  }
}

export {};
