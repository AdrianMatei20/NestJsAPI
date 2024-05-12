import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LogInUserDto {

    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({type: String, description: 'User\'s email address.', example: 'adrian.matei@fakemail.com'})
    email: string;

    @IsNotEmpty()
    @ApiProperty({type: String, description: 'User\'s password.', example: 'P@ssword123'})
    password: string;

}
