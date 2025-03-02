import { RegisterUserDto } from "src/resources/user/dto/register-user.dto"
import { userJamesSmith } from "./users"

const password = 'P@ssword123';
const badPassword = 'Password';

export function getRegisterUserDto(): RegisterUserDto {
    const registerUserDto = {
        firstname: userJamesSmith.firstname,
        lastname: userJamesSmith.lastname,
        email: userJamesSmith.email,
        password: password,
        passwordConfirmation: password,
    };

    return registerUserDto;
};

export const registerUserDto: RegisterUserDto = {
    firstname: userJamesSmith.firstname,
    lastname: userJamesSmith.lastname,
    email: userJamesSmith.email,
    password: password,
    passwordConfirmation: password,
};

export const emptyRegisterUserDto: Partial<RegisterUserDto> = {};

export const registerUserDtoNoFirstname: Partial<RegisterUserDto> = {
    lastname: userJamesSmith.lastname,
    email: userJamesSmith.email,
    password: password,
    passwordConfirmation: password,
};

export const registerUserDtoNoLastname: Partial<RegisterUserDto> = {
    firstname: userJamesSmith.firstname,
    email: userJamesSmith.email,
    password: password,
    passwordConfirmation: password,
};

export const registerUserDtoNoEmail: Partial<RegisterUserDto> = {
    firstname: userJamesSmith.firstname,
    lastname: userJamesSmith.lastname,
    password: password,
    passwordConfirmation: password,
};

export const registerUserDtoNoPassword: Partial<RegisterUserDto> = {
    firstname: userJamesSmith.firstname,
    lastname: userJamesSmith.lastname,
    email: userJamesSmith.email,
    passwordConfirmation: password,
};

export const registerUserDtoNoPasswordConfirmation: Partial<RegisterUserDto> = {
    firstname: userJamesSmith.firstname,
    lastname: userJamesSmith.lastname,
    email: userJamesSmith.email,
    password: password,
};

export const registerUserDtoPasswordsNotMatching: RegisterUserDto = {
    firstname: userJamesSmith.firstname,
    lastname: userJamesSmith.lastname,
    email: userJamesSmith.email,
    password: password,
    passwordConfirmation: badPassword,
};