import { RegisterUserDto } from "src/resources/user/dto/register-user.dto"
import { user, userChristopherAnderson, userJamesSmith, userJohnThomas, userLisaMitchell, userMaryWright, userMichelleJohnson, userRonaldClark } from "./users"
import { LogInUserDto } from "src/auth/dto/log-in-user.dto";
import { UpdateUserDto } from "src/resources/user/dto/update-user.dto";

const password = 'P@ssword123';
const badPassword = 'Password';

export function getJamesSmithRegisterUserDto(): RegisterUserDto {
    const registerUserDto: RegisterUserDto = {
        firstname: userJamesSmith.firstname,
        lastname: userJamesSmith.lastname,
        email: userJamesSmith.email,
        password: password,
        passwordConfirmation: password,
    };

    return registerUserDto;
};

export function getChristopherAndersonRegisterUserDto(): RegisterUserDto {
    const registerUserDto: RegisterUserDto = {
        firstname: userChristopherAnderson.firstname,
        lastname: userChristopherAnderson.lastname,
        email: userChristopherAnderson.email,
        password: password,
        passwordConfirmation: password,
    };

    return registerUserDto;
};

export function getRonaldClarkRegisterUserDto(): RegisterUserDto {
    const registerUserDto: RegisterUserDto = {
        firstname: userRonaldClark.firstname,
        lastname: userRonaldClark.lastname,
        email: userRonaldClark.email,
        password: password,
        passwordConfirmation: password,
    };

    return registerUserDto;
};

export function getMaryWrightRegisterUserDto(): RegisterUserDto {
    const registerUserDto: RegisterUserDto = {
        firstname: userMaryWright.firstname,
        lastname: userMaryWright.lastname,
        email: userMaryWright.email,
        password: password,
        passwordConfirmation: password,
    };

    return registerUserDto;
};

export function getLisaMitchellRegisterUserDto(): RegisterUserDto {
    const registerUserDto: RegisterUserDto = {
        firstname: userLisaMitchell.firstname,
        lastname: userLisaMitchell.lastname,
        email: userLisaMitchell.email,
        password: password,
        passwordConfirmation: password,
    };

    return registerUserDto;
};

export function getMichelleJohnsonRegisterUserDto(): RegisterUserDto {
    const registerUserDto: RegisterUserDto = {
        firstname: userMichelleJohnson.firstname,
        lastname: userMichelleJohnson.lastname,
        email: userMichelleJohnson.email,
        password: password,
        passwordConfirmation: password,
    };

    return registerUserDto;
};

export function getJohnThomasRegisterUserDto(): RegisterUserDto {
    const registerUserDto: RegisterUserDto = {
        firstname: userJohnThomas.firstname,
        lastname: userJohnThomas.lastname,
        email: userJohnThomas.email,
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

export const loginUserDto: LogInUserDto = {
    email: user.email,
    password: user.password,
};

export const updateUserDto: UpdateUserDto = {
    firstname: userChristopherAnderson.firstname,
    lastname: userChristopherAnderson.lastname,
    email: userChristopherAnderson.email,
};

export function getSanitizedRegisterUserDto(registerUserDto: RegisterUserDto) {
    const { password, passwordConfirmation, ...rest } = registerUserDto;

    const sanitizedRegisterUserDto = {
        ...rest,
        password: password ? '[REDACTED]' : undefined,
        passwordConfirmation: passwordConfirmation ? '[REDACTED]' : undefined,
    };

    return sanitizedRegisterUserDto;
}