import { Controller, Get, Param, Delete, NotFoundException, UseGuards, HttpStatus, Req, InternalServerErrorException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { validate as isValidUUID } from 'uuid';
import { UserService } from './user.service';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { User } from './entities/user.entity';
import { PublicUserDto } from './dto/public-user.dto';
import { AdminUserDto } from './dto/admin-user.dto';
import { GlobalRole } from './enums/global-role';
import { GlobalAdminGuard } from 'src/auth/guards/global-admin.guard';
import { RETURN_MESSAGES } from 'src/constants/return-messages';

@ApiTags('user')
@Controller('user')
//@ApiExcludeController(true)
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  @Get()
  @UseGuards(AuthenticatedGuard)
  async findAll(@Req() req): Promise<CustomMessageDto<PublicUserDto[] | AdminUserDto[]>> {
    const users: User[] = await this.userService.findAll();

    switch (req.user.globalRole) {

      case (GlobalRole.ADMIN): {
        return {
          statusCode: HttpStatus.OK,
          message: RETURN_MESSAGES.OK.N_USERS_FOUND(users.length),
          data: users.map(user => new AdminUserDto(user)),
        }
      }

      case (GlobalRole.REGULAR_USER): {
        return {
          statusCode: HttpStatus.OK,
          message: RETURN_MESSAGES.OK.N_USERS_FOUND(users.length),
          data: users.map(user => new PublicUserDto(user)),
        }
      }

      default: {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
        });
      }

    }
  }

  @Get(':id')
  @UseGuards(AuthenticatedGuard)
  async findOne(@Req() req, @Param('userId') userId: string): Promise<CustomMessageDto<PublicUserDto | AdminUserDto>> {
    // Check if the id is a valid UUID
    if (!isValidUUID(userId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: RETURN_MESSAGES.BAD_REQUEST.INVALID_USER_ID,
      });
    }

    // Check if the user exists
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: RETURN_MESSAGES.NOT_FOUND.USER,
      });
    }

    switch (req.user.globalRole) {

      case (GlobalRole.ADMIN): {
        return {
          statusCode: HttpStatus.OK,
          message: RETURN_MESSAGES.OK.USER_FOUND,
          data: new AdminUserDto(user),
        }
      }

      case (GlobalRole.REGULAR_USER): {
        return {
          statusCode: HttpStatus.OK,
          message: RETURN_MESSAGES.OK.USER_FOUND,
          data: new PublicUserDto(user),
        }
      }

      default: {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
        });
      }

    }
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(GlobalAdminGuard)
  async remove(@Param('id') userId: string) {
    // Check if the id is a valid UUID
    if (!isValidUUID(userId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: RETURN_MESSAGES.BAD_REQUEST.INVALID_USER_ID,
      });
    }

    // Check if the user exists
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: RETURN_MESSAGES.NOT_FOUND.USER,
      });
    }

    if (await this.userService.remove(userId)) {
      return {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.USER_DELETED,
      }
    }

    throw new InternalServerErrorException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
}
