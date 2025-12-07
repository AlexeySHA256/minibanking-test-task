import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { Account } from '@/entities/account.entity';
import { AccountsService } from '../accounts/accounts.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  @Inject() jwtService: JwtService;
  @Inject() accountsService: AccountsService;
  @InjectRepository(User) userRepo: Repository<User>;

  async login(dto: LoginDto) {
    const user = await this.userRepo
      .createQueryBuilder()
      .where('lower(email) = lower(:email)', { email: dto.email })
      .getOne();

    if (!user) throw new UnauthorizedException('Invalid email or password');

    const passwordsMatches = await bcrypt.compare(dto.password, user.password)
    if (!passwordsMatches)
      throw new UnauthorizedException('Invalid email or password');

    const token = await this.jwtService.signAsync({
      id: user.id,
      name: user.name,
    });

    return { user, token };
  }

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = this.userRepo.create({ ...dto, password: passwordHash });

    try {
      await this.userRepo.manager.transaction(async (dbTransaction) => {
        await dbTransaction.save(user);
        const accounts =
          await this.accountsService.createAndCreditInitialAccounts(
            dbTransaction,
            user.id,
          );
        user.accounts = accounts;
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('unique constraint')
      ) {
        throw new ConflictException('User already registered');
      }
      throw error;
    }

    const token = await this.jwtService.signAsync({
      id: user.id,
      name: user.name,
    });

    return { user, token };
  }

  async getMe(userId: number) {
    return this.userRepo
      .createQueryBuilder('user')
      .where({ id: userId })
      .leftJoinAndMapMany(
        'user.accounts',
        Account,
        'account',
        `account."userId" = "user".id`,
      )
      .getOne();
  }
}
