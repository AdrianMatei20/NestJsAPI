import { ApiProperty } from "@nestjs/swagger";

export class CustomMessageDto<T> {

    @ApiProperty({ description: 'HTTP status code of the response', example: 200 })
    statusCode: number;
  
    @ApiProperty({ description: 'A human-readable message', example: 'successful action' })
    message?: string;
  
    @ApiProperty({ description: 'Data returned in the response', isArray: true })
    data?: T;
    
  }