import { ApiProperty } from "@nestjs/swagger";

export class SimpleMessageDto {

    @ApiProperty({ description: 'HTTP status code of the response', example: 200 })
    statusCode: number;
  
    @ApiProperty({ description: 'A human-readable message', example: 'successful action' })
    message: string;
    
  }