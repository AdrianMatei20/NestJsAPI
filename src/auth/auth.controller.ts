import { Controller, Get, Post, Body, Delete, UseGuards, Req, Res, Param, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/resources/user/dto/register-user.dto';
import { LogInUserDto } from './dto/log-in-user.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({summary: 'Creates a new (unverified) account.'})
  @ApiResponse({status: HttpStatus.CREATED, description: 'account created and email sent'})
  @ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'invalid json, missing properties or passwords not matching'})
  @ApiResponse({status: HttpStatus.CONFLICT, description: 'email already registered'})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error'})
  @ApiResponse({status: HttpStatus.SERVICE_UNAVAILABLE, description: 'couldn\'t send confirmation email'})
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<SimpleMessageDto> {
    return this.authService.registerUser(registerUserDto);
  }

  @Get('verify-user/:id/:token')
  @ApiOperation({summary: 'Marks the account as \'verified\'.'})
  @ApiResponse({status: HttpStatus.CREATED, description: 'user verified successfully'})
  @ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'invalid user id'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'expired or invalid token'})
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'user not found'})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error'})
  async verifyUser(
    @Param('id') id: string,
    @Param('token') token: string,
  ): Promise<SimpleMessageDto> {
    return this.authService.verifyUser(id, token);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({summary: 'Logs in the user.'})
  @ApiResponse({status: HttpStatus.CREATED, description: 'successful login'})
  @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'invalid credentials'})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error'})
  async loginUser(@Body() loginUserDto: LogInUserDto): Promise<SimpleMessageDto> {
    const result = await this.authService.findByEmail(loginUserDto.email);
    return {
      statusCode: 201,
      message: `Successfully logged in. Welcome ${result.data.firstname} ${result.data.lastname}!`
    }
  }

  @Get('reset-password')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({summary: 'Sends a password reset email. (user is logged in and wants to change the password)'})
  @ApiResponse({status: HttpStatus.OK, description: 'password reset email sent'})
  @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'invalid credentials'})
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'user not found'})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error'})
  @ApiResponse({status: HttpStatus.SERVICE_UNAVAILABLE, description: 'could\'t send password reset email'})
  async sendResetPasswordEmail(@Req() req): Promise<SimpleMessageDto> {
    return await this.authService.sendResetPasswordEmail(req.user.id);
  }

  @Post('forgot-password')
  @ApiOperation({summary: 'Sends a password reset email. (user doesn\'t remember the password and can\'t log in)'})
  @ApiResponse({status: HttpStatus.OK, description: 'password reset email sent'})
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'user not found'})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error'})
  @ApiResponse({status: HttpStatus.SERVICE_UNAVAILABLE, description: 'could\'t send password reset email'})
  async sendForgotPasswordEmail(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<SimpleMessageDto> {
    return await this.authService.sendForgotPasswordEmail(forgotPasswordDto);
  }

  @Post('reset-password/:id/:token')
  @ApiOperation({summary: 'Resets the user\'s password.'})
  @ApiResponse({status: HttpStatus.OK, description: 'password reset successful'})
  @ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'invalid user id or passwords don\'t match'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'expired or invalid token'})
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'user not found'})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error'})
  @ApiResponse({status: HttpStatus.SERVICE_UNAVAILABLE, description: 'could\'t update user password'})
  async resetPassword(
    @Param('id') id: string,
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<SimpleMessageDto> {
    return await this.authService.resetPassword(id, token, resetPasswordDto);
  }

  @Delete()
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({summary: 'Deletes user\'s account.'})
  @ApiResponse({status: HttpStatus.OK, description: 'user account deleted successfully'})
  @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'invalid credentials'})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error'})
  async deleteUser(@Req() req, @Res({passthrough: true}) res): Promise<SimpleMessageDto> {
    if(req.session) {
      req.session.destroy();
      res.clearCookie('SESSION_ID');
      return await this.authService.deleteUser(req.user.id);
    }
  }

  @Get('logout')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({summary: 'Logs out the user.'})
  @ApiResponse({status: HttpStatus.OK, description: 'successfull logout'})
  @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'invalid credentials'})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'internal server error'})
  async logoutUser(@Req() req, @Res({passthrough: true}) res): Promise<SimpleMessageDto> {
    if(req.session) {
      req.session.destroy();
      res.clearCookie('SESSION_ID');
      return {
        statusCode: 200,
        message: 'user session ended'
      }
    }
  }

}
