import { Controller, Get, Param, Delete, NotFoundException, UseGuards, HttpStatus, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../../../src/auth/guards/authenticated.guard';
import { CustomMessageDto } from '../../../src/shared/utils/custom-message.dto';
import { User } from './entities/user.entity';
import { PublicUserDto } from './dto/public-user.dto';
import { AdminUserDto } from './dto/admin-user.dto';
import { GlobalRole } from './enums/global-role';
import { GlobalAdminGuard } from '../../../src/auth/guards/global-admin.guard';

@ApiTags('user')
@Controller('user')
//@ApiExcludeController(true)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @UseGuards(AuthenticatedGuard)
  async findAll(@Req() req): Promise<CustomMessageDto<PublicUserDto[] | AdminUserDto[]>> {
    const users: User[] = await this.userService.findAll();

    switch (req.user.globalRole) {

      case (GlobalRole.ADMIN): {
        return {
          statusCode: HttpStatus.CREATED,
          message: `${users.length} user${users.length == 1 ? '' : 's'} found`,
          data: users.map(user => new AdminUserDto(user)),
        }
      }

      case (GlobalRole.REGULAR_USER): {
        return {
          statusCode: HttpStatus.CREATED,
          message: `${users.length} user${users.length == 1 ? '' : 's'} found`,
          data: users.map(user => new PublicUserDto(user)),
        }
      }

      default: {
        return {
          statusCode: HttpStatus.CREATED,
          message: `${users.length} user${users.length == 1 ? '' : 's'} found`,
          data: users.map(user => new PublicUserDto(user)),
        }
      }

    }
  }

  @Get(':id')
  @UseGuards(AuthenticatedGuard)
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found!')
    }
    return user;
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(GlobalAdminGuard)
  async remove(@Param('id') id: string) {
    if (await this.userService.remove(id)) {
      return {
        statusCode: HttpStatus.OK,
        message: 'user deleted',
      }
    }
  }
}
