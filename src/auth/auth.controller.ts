import { Controller, Get, Post, Body, Delete, UseGuards, Req, Res, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/resources/user/dto/register-user.dto';
import { LogInUserDto } from './dto/log-in-user.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({summary: 'Creates a new (unverified) account.'})
  @ApiResponse({status: 201, description: 'account created and email sent'})
  @ApiResponse({status: 400, description: 'invalid json, missing properties or passwords not matching'})
  @ApiResponse({status: 409, description: 'email already registered'})
  @ApiResponse({status: 500, description: 'internal server error'})
  @ApiResponse({status: 503, description: 'couldn\'t send confirmation email'})
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @Get('verify-user/:id/:token')
  @ApiOperation({summary: 'Marks the account as \'verified\'.'})
  @ApiResponse({status: 201, description: 'user verified successfully'})
  @ApiResponse({status: 400, description: 'invalid user id'})
  @ApiResponse({status: 403, description: 'expired or invalid token'})
  @ApiResponse({status: 404, description: 'user not found'})
  @ApiResponse({status: 500, description: 'internal server error'})
  async verifyUser(
    @Param('id') id: string,
    @Param('token') token: string,
  ) {
    return this.authService.verifyUser(id, token);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({summary: 'Logs in the user.'})
  @ApiResponse({status: 201, description: 'successful login'})
  @ApiResponse({status: 401, description: 'invalid credentials'})
  @ApiResponse({status: 500, description: 'internal server error'})
  async loginUser(@Body() loginUserDto: LogInUserDto) {
    const user = await this.authService.findByEmail(loginUserDto.email);
    return { message: `Successfully logged in. Welcome ${user.firstname} ${user.lastname}!` }
  }

  @Get('reset-password')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({summary: 'Sends a password reset email. (user is logged in and wants to change the password)'})
  @ApiResponse({status: 200, description: 'password reset email sent'})
  @ApiResponse({status: 401, description: 'invalid credentials'})
  @ApiResponse({status: 404, description: 'user not found'})
  @ApiResponse({status: 500, description: 'internal server error'})
  @ApiResponse({status: 503, description: 'could\'t send password reset email'})
  async sendResetPasswordEmail(@Req() req) {
    return await this.authService.sendResetPasswordEmail(req.user.id);
  }

  @Post('forgot-password')
  @ApiOperation({summary: 'Sends a password reset email. (user doesn\'t remember the password and can\'t log in)'})
  @ApiResponse({status: 200, description: 'password reset email sent'})
  @ApiResponse({status: 404, description: 'user not found'})
  @ApiResponse({status: 500, description: 'internal server error'})
  @ApiResponse({status: 503, description: 'could\'t send password reset email'})
  async sendForgotPasswordEmail(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.sendForgotPasswordEmail(forgotPasswordDto);
  }

  @Post('reset-password/:id/:token')
  @ApiOperation({summary: 'Resets the user\'s password.'})
  @ApiResponse({status: 200, description: 'password reset successful'})
  @ApiResponse({status: 400, description: 'invalid user id or passwords don\'t match'})
  @ApiResponse({status: 403, description: 'expired or invalid token'})
  @ApiResponse({status: 404, description: 'user not found'})
  @ApiResponse({status: 500, description: 'internal server error'})
  @ApiResponse({status: 503, description: 'could\'t update user password'})
  async resetPassword(
    @Param('id') id: string,
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(id, token, resetPasswordDto);
  }

  @Delete()
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({summary: 'Deletes user\'s account.'})
  @ApiResponse({status: 200, description: 'user account deleted successfully'})
  @ApiResponse({status: 401, description: 'invalid credentials'})
  @ApiResponse({status: 500, description: 'internal server error'})
  async deleteUser(@Req() req, @Res({passthrough: true}) res) {
    if(req.session) {
      req.session.destroy();
      res.clearCookie('SESSION_ID');
      await this.authService.deleteUser(req.user.id);
      return { message: 'account deleted' }
    }
  }

  @Get('logout')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({summary: 'Logs out the user.'})
  @ApiResponse({status: 200, description: 'successfull logout'})
  @ApiResponse({status: 401, description: 'invalid credentials'})
  @ApiResponse({status: 500, description: 'internal server error'})
  async logoutUser(@Req() req, @Res({passthrough: true}) res) {
    if(req.session) {
      req.session.destroy();
      res.clearCookie('SESSION_ID');
      return { message: 'user session ended' }
    }
  }

}
