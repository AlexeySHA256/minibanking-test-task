import { Body, Controller, Get, Inject, Post, Res } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import ms from "ms"
import { ConfigService } from '@nestjs/config';
import { Serialize } from '@/common/decorators/serialize.decorator';
import { GetMeResponseDto } from './dto/get-me.dto';
import { RegisterDto } from './dto/register.dto';
import { UserOnly } from '@/common/guards/user-only.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthPayload } from '@/common/types';

@Controller('auth')
export class AuthController {
  @Inject() authService: AuthService
  @Inject() configService: ConfigService

  @Post('/login')
  @Serialize(GetMeResponseDto)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { user, token } = await this.authService.login(dto)
    this.setTokenCookie(token, response)

    return user
  }

  @Post('/register')
  @Serialize(GetMeResponseDto)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const { user, token } = await this.authService.register(dto)
    this.setTokenCookie(token, response)

    return user

  }

  @Get('/me')
  @Serialize(GetMeResponseDto)
  @UserOnly()
  async getMe(@CurrentUser() user: AuthPayload) {
    return this.authService.getMe(user.id)
  }

  private setTokenCookie(token: string, response: Response) {
    response.cookie('accessToken', token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: true,
      maxAge: ms(this.configService.getOrThrow<ms.StringValue>("JWT_EXPIRATION"))
    })
  }
}
