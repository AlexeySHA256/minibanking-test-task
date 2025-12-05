import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  @Inject() jwtService: JwtService
  @InjectRepository(User) userRepo: Repository<User>

  async login(dto: LoginDto) {
    const user = await this.userRepo.createQueryBuilder()
      .where('lower(email) = lower(:email)', { email: dto.email })
      .getOne()

    if (!user) throw new UnauthorizedException("Invalid email or password")
    if (user.password !== dto.password) throw new UnauthorizedException("Invalid email or password")

    const token = this.jwtService.signAsync({ id: user.id, name: user.name })

    return { user, token }
  }
}
