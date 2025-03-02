import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export class SimpleMessageDto {

    @ApiProperty({ description: 'HTTP status code of the response', example: HttpStatus.OK })
    statusCode: number;
  
    @ApiProperty({ description: 'A human-readable message', example: 'successful action' })
    message: string;
    
  }