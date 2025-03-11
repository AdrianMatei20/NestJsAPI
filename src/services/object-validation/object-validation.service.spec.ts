import { Test, TestingModule } from '@nestjs/testing';
import { ObjectValidationService } from './object-validation.service';

import { RegisterUserDto } from 'src/resources/user/dto/register-user.dto';
import { CreateProjectDto } from 'src/resources/project/dto/create-project.dto';
import { UpdateProjectDto } from 'src/resources/project/dto/update-project.dto';

import { emptyRegisterUserDto, registerUserDtoNoEmail, registerUserDtoNoFirstname, registerUserDtoNoLastname, registerUserDtoNoPassword, registerUserDtoNoPasswordConfirmation } from 'test/data/register-user';
import { createProjectDtoEmpty, createProjectDtoNoDescription, createProjectDtoNoName, updateProjectDtoEmpty, updateProjectDtoNoDescription, updateProjectDtoNoName } from 'test/data/projects';

describe('ObjectValidationService', () => {
  let objectValidationService: ObjectValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObjectValidationService],
    }).compile();

    objectValidationService = module.get<ObjectValidationService>(ObjectValidationService);
  });

  it('should be defined', () => {
    expect(objectValidationService).toBeDefined();
  });

  describe('getMissingPropertiesForRegisterUserDto', () => {

    it('should return a list with all parameters for empty object', () => {
      const missingProperties = objectValidationService.getMissingPropertiesForRegisterUserDto(emptyRegisterUserDto as RegisterUserDto);
      expect(missingProperties).toEqual(['firstname', 'lastname', 'email', 'password', 'passwordConfirmation']);
    });

    it('should return a list with \'firstname\' for missing firstname', () => {
      const missingProperties = objectValidationService.getMissingPropertiesForRegisterUserDto(registerUserDtoNoFirstname as RegisterUserDto);
      expect(missingProperties).toEqual(['firstname']);
    });

    it('should return a list with \'lastname\' for missing lastname', () => {
      const missingProperties = objectValidationService.getMissingPropertiesForRegisterUserDto(registerUserDtoNoLastname as RegisterUserDto);
      expect(missingProperties).toEqual(['lastname']);
    });

    it('should return a list with \'email\' for missing email', () => {
      const missingProperties = objectValidationService.getMissingPropertiesForRegisterUserDto(registerUserDtoNoEmail as RegisterUserDto);
      expect(missingProperties).toEqual(['email']);
    });

    it('should return a list with \'password\' for missing password', () => {
      const missingProperties = objectValidationService.getMissingPropertiesForRegisterUserDto(registerUserDtoNoPassword as RegisterUserDto);
      expect(missingProperties).toEqual(['password']);
    });

    it('should return a list with \'passwordConfirmation\' for missing passwordConfirmation', () => {
      const missingProperties = objectValidationService.getMissingPropertiesForRegisterUserDto(registerUserDtoNoPasswordConfirmation as RegisterUserDto);
      expect(missingProperties).toEqual(['passwordConfirmation']);
    });

  });

  describe('getMissingPropertiesForCreateProjectDto', () => {

    it('should return a list with all parameters for empty object', () => {
      const missingProperties = objectValidationService.getMissingPropertiesForCreateProjectDto(createProjectDtoEmpty as CreateProjectDto);
      expect(missingProperties).toEqual(['name', 'description']);
    });

    it('should return a list with \'name\' for missing name', () => {
      const missingProperties = objectValidationService.getMissingPropertiesForCreateProjectDto(createProjectDtoNoName as CreateProjectDto);
      expect(missingProperties).toEqual(['name']);
    });

    it('should return a list with \'lastname\' for missing lastname', () => {
      const missingProperties = objectValidationService.getMissingPropertiesForCreateProjectDto(createProjectDtoNoDescription as CreateProjectDto);
      expect(missingProperties).toEqual(['description']);
    });

  });

  describe('getMissingPropertiesForUpdateProjectDto', () => {

    it('should return a list with all parameters for empty object', () => {
      const missingProperties = objectValidationService.getMissingPropertiesForUpdateProjectDto(updateProjectDtoEmpty as UpdateProjectDto);
      expect(missingProperties).toEqual(['name', 'description']);
    });

    it('should return a list with \'name\' for missing name', () => {
      const missingProperties = objectValidationService.getMissingPropertiesForUpdateProjectDto(updateProjectDtoNoName as UpdateProjectDto);
      expect(missingProperties).toEqual(['name']);
    });

    it('should return a list with \'lastname\' for missing lastname', () => {
      const missingProperties = objectValidationService.getMissingPropertiesForUpdateProjectDto(updateProjectDtoNoDescription as UpdateProjectDto);
      expect(missingProperties).toEqual(['description']);
    });

  });

});
