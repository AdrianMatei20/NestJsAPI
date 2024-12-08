import { ApiProperty } from "@nestjs/swagger";

export class UserDto {

    @ApiProperty({type: String, description: 'User\'s id.', example: 'af7c1fe6-d669-414e-b066-e9733f0de7a8'})
    readonly id: string;

    @ApiProperty({type: String, description: 'User\'s firstname.', example: 'Adrian'})
    readonly firstname: string;
    
    @ApiProperty({type: String, description: 'User\'s lastname.', example: 'Matei'})
    readonly lastname: string;

    @ApiProperty({type: String, description: 'User\'s email address.', example: 'adrian.matei@fakemail.com'})
    readonly email: string;

}
