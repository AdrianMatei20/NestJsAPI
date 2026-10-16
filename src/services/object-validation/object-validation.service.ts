import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from 'src/resources/user/dto/register-user.dto';
import { CreateProjectDto } from 'src/resources/project/dto/create-project.dto';
import { UpdateProjectDto } from 'src/resources/project/dto/update-project.dto';
import { CreateIssueDto } from 'src/resources/issue/dto/create-issue.dto';
import { CreateLabelDto } from 'src/resources/label/dto/create-label.dto';
import { CreateCommentDto } from 'src/resources/comment/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/resources/comment/dto/update-comment.dto';

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

    private createIssueDtoSchema: Record<'projectId' | 'title' | 'description', string> = {
      projectId: 'string',
      title: 'string',
      description: 'string',
    }

    private createLabelDtoSchema: Record<keyof CreateLabelDto, string> = {
      projectId: 'string',
      name: 'string',
      color: 'string',
    }

    private createCommentDtoSchema: Record<keyof CreateCommentDto, string> = {
      issueId: 'string',
      body: 'string',
    }

    private updateCommentDtoSchema: Record<keyof UpdateCommentDto, string> = {
      body: 'string',
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

    public getMissingPropertiesForCreateIssueDto(input: CreateIssueDto): string[] {
        return Object.keys(this.createIssueDtoSchema)
            .filter(key => input[key] === undefined)
            .map(key => key as keyof typeof input)
            .map(key => `${key.toString()}`);
    }

    public getMissingPropertiesForCreateLabelDto(input: CreateLabelDto): string[] {
        return Object.keys(this.createLabelDtoSchema)
            .filter(key => input[key] === undefined)
            .map(key => key as keyof typeof input)
            .map(key => `${key.toString()}`);
    }

    public getMissingPropertiesForCreateCommentDto(input: CreateCommentDto): string[] {
        return Object.keys(this.createCommentDtoSchema)
            .filter(key => input[key] === undefined)
            .map(key => key as keyof typeof input)
            .map(key => `${key.toString()}`);
    }

    public getMissingPropertiesForUpdateCommentDto(input: UpdateCommentDto): string[] {
        return Object.keys(this.updateCommentDtoSchema)
            .filter(key => input[key] === undefined)
            .map(key => key as keyof typeof input)
            .map(key => `${key.toString()}`);
    }

}