import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from 'src/resources/user/dto/register-user.dto';
import { CreateProjectDto } from 'src/resources/project/dto/create-project.dto';
import { UpdateProjectDto } from 'src/resources/project/dto/update-project.dto';

@Injectable()
export class ObjectValidationService {

    private registerUserDtoSchema: Record<keyof RegisterUserDto, string> = {
        firstname: 'string',
        lastname: 'string',
        email: 'string',
        password: 'string',
        passwordConfirmation: 'string',
    }

    private createProjectDtoSchema: Record<keyof CreateProjectDto, string> = {
      name: 'string',
      description: 'string',
    }

    private updateProjectDtoSchema: Record<keyof UpdateProjectDto, string> = {
      name: 'string',
      description: 'string',
    }

    public getMissingPropertiesForRegisterUserDto(input: RegisterUserDto): string[] {
        return Object.keys(this.registerUserDtoSchema)
            .filter(key => input[key] === undefined)
            .map(key => key as keyof typeof input)
            .map(key => `${key.toString()}`);
    }

    public getMissingPropertiesForCreateProjectDto(input: CreateProjectDto): string[] {
        return Object.keys(this.createProjectDtoSchema)
            .filter(key => input[key] === undefined)
            .map(key => key as keyof typeof input)
            .map(key => `${key.toString()}`);
    }

    public getMissingPropertiesForUpdateProjectDto(input: UpdateProjectDto): string[] {
        return Object.keys(this.updateProjectDtoSchema)
            .filter(key => input[key] === undefined)
            .map(key => key as keyof typeof input)
            .map(key => `${key.toString()}`);
    }

}