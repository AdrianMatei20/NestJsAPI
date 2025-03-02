import { ApiProperty } from "@nestjs/swagger";
import { GlobalRole } from "../enums/global-role";
import { User } from "../entities/user.entity";

export class AdminUserDto {

    @ApiProperty({ type: String, description: 'User\'s id.', example: 'af7c1fe6-d669-414e-b066-e9733f0de7a8' })
    readonly id: string;

    @ApiProperty({ type: String, description: 'User\'s firstname.', example: 'Adrian' })
    readonly firstname: string;

    @ApiProperty({ type: String, description: 'User\'s lastname.', example: 'Matei' })
    readonly lastname: string;

    @ApiProperty({ type: String, description: 'User\'s email address.', example: 'adrian.matei@fakemail.com' })
    readonly email: string;

    @ApiProperty({ type: Date, description: 'User\'s join date.', example: '2024-01-01T12:00:00Z' })
    readonly createdAt: Date;

    @ApiProperty({ type: Boolean, description: 'User\'s email status.', example: true })
    readonly emailVerified: boolean;

    @ApiProperty({ type: GlobalRole, description: 'User\'s role in the app.', example: GlobalRole.REGULAR_USER })
    readonly globalRole: GlobalRole;

    constructor(user: User) {
        this.id = user.id;
        this.firstname = user.firstname;
        this.lastname = user.lastname;
        this.email = user.email;
        this.createdAt = user.createdAt;
        this.emailVerified = user.emailVerified;
        this.globalRole = user.globalRole;
    }
    
}
