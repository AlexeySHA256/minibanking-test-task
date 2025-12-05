import { Body, Controller, Get, Inject, Post, Res } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import ms from "ms"
import { ConfigService } from '@nestjs/config';
import { Serialize } from '@/common/decorators/serialize.decorator';
import { GetMeResponseDto } from './dto/get-me.dto';

@Controller('auth')
export class AuthController {
  @Inject() authService: AuthService
  @Inject() configService: ConfigService

  @Post('/login')
  @Serialize(GetMeResponseDto)
  async login(@Body() dto: LoginDto, @Res() response: Response) {
    const { user, token } = await this.authService.login(dto)

    response.cookie('accessToken', token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: true,
      maxAge: ms(this.configService.getOrThrow<ms.StringValue>("JWT_EXPIRATION"))
    })

    return user
  }

  @Post('/register')
  async register() { }

  @Get('/me')
  async getMe() { }
}
