import { ApiProperty } from "@nestjs/swagger";

export class RegisterUserDto {

    @ApiProperty({type: String, description: 'User\'s firstname.', example: 'Adrian'})
    firstname: string;
    
    @ApiProperty({type: String, description: 'User\'s lastname.', example: 'Matei'})
    lastname: string;

    @ApiProperty({type: String, description: 'User\'s email address.', example: 'adrian.matei@fakemail.com'})
    email: string;

    @ApiProperty({type: String, description: 'User\'s password.', example: 'P@ssword123'})
    password: string;

    @ApiProperty({type: String, description: 'User\'s password again.', example: 'P@ssword123'})
    passwordConfirmation: string;

}
