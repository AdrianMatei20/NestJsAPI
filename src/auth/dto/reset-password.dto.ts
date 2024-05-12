import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ResetPasswordDto {

    @IsNotEmpty()
    @ApiProperty({type: String, description: 'User\'s new password.', example: 'P@ssword123'})
    password: string;

    @IsNotEmpty()
    @ApiProperty({type: String, description: 'User\'s new password again.', example: 'P@ssword123'})
    passwordConfirmation: string;
    
}
