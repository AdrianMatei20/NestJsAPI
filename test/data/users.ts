import { ForgotPasswordDto } from "../../src/auth/dto/forgot-password.dto";
import { LogInUserDto } from "../../src/auth/dto/log-in-user.dto";
import { ResetPasswordDto } from "../../src/auth/dto/reset-password.dto";
import { ResetPassword } from "../../src/auth/reset-password/reset-password.entity";
import { PublicUserDto } from "../../src/resources/user/dto/public-user.dto";
import { User } from "../../src/resources/user/entities/user.entity";
import { GlobalRole } from "../../src/resources/user/enums/global-role";
import { userUUIDs, UUIDs } from "../../test/data/UUIDs";

export const userJamesSmith: PublicUserDto = {
    id: userUUIDs[0],
    firstname: 'James',
    lastname: 'Smith',
    email: 'jamessmith@fakemail.com',
    createdAt: new Date('2020/01/18 18:32:03'),
};

export const userChristopherAnderson: PublicUserDto = {
    id: userUUIDs[1],
    firstname: "Christopher",
    lastname: "Anderson",
    email: "christopheranderson@fakemail.com",
    createdAt: new Date('2020/02/07 04:44:36'),
};

export const userRonaldClark: PublicUserDto = {
    id: userUUIDs[2],
    firstname: "Ronald",
    lastname: "Clark",
    email: "ronaldclark@fakemail.com",
    createdAt: new Date('2020/03/28 02:06:26'),
};

export const userMaryWright: PublicUserDto = {
    id: userUUIDs[3],
    firstname: "Mary",
    lastname: "Wright",
    email: "marywright@fakemail.com",
    createdAt: new Date('2020/04/06 23:15:44'),
};

export const userAdmin: PublicUserDto = {
    id: userUUIDs[4],
    firstname: "Adrian",
    lastname: "Matei",
    email: "adrian.matei@fakemail.com",
    createdAt: new Date('2020/01/01 00:00:00'),
};

export const logInUserDto: LogInUserDto = {
    email: userJamesSmith.email,
    password: 'P@ssword123',
};

export const forgotPasswordDto: ForgotPasswordDto = {
    email: userJamesSmith.email,
};

export function getResetPasswordDto(): ResetPasswordDto {
    const resetPasswordDto: ResetPasswordDto = {
        password: 'NewP@ssword123',
        passwordConfirmation: 'NewP@ssword123',
    }

    return resetPasswordDto;
};

export const badResetPasswordDto: ResetPasswordDto = {
    password: 'NewP@ssword123',
    passwordConfirmation: 'NewP@ssword1',
}

export const resetPassword: ResetPassword = {
    id: UUIDs[25],
    user: userJamesSmith as User,
    token: 'token',
    createdAt: new Date(Date.now() - 1),
    expiresAt: new Date(Date.now() + 1),
}

export const user: User = {
    id: userUUIDs[0],
    firstname: 'James',
    lastname: 'Smith',
    email: 'jamessmith@fakemail.com',
    createdAt: new Date('2020/01/18 18:32:03'),
    password: '$2b$12$kfy.GWm4v4DmXGlaSbCXMO/mEJgEdKQuWl8Fy/UFLf0K678wFsA1q',
    emailVerified: true,
    globalRole: GlobalRole.REGULAR_USER,
    resetPassword: [],
    userProjectRole: [],
};

export const users: User[] = [
    user,
    user,
    user,
];