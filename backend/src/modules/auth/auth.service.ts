import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { Account } from '@/entities/account.entity';
import { Currency } from '@/common/types';
import { Ledger } from '@/entities/ledger.entity';

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

    const token = await this.jwtService.signAsync({ id: user.id, name: user.name })

    return { user, token }
  }

  async register(dto: RegisterDto) {
    const user = this.userRepo.create(dto)

    try {
      await this.userRepo.manager.transaction(async (transaction) => {
        await transaction.save(user)

        const accountsInsertResult = await transaction.createQueryBuilder(Account, 'account')
          .insert()
          .values([
            { currency: Currency.USD, balance: 1000, userId: user.id },
            { currency: Currency.EUR, balance: 500, userId: user.id }
          ])
          .returning('*')
          .execute()

        const [usdAccount, eurAccount] = accountsInsertResult.generatedMaps as [Account, Account]

        await transaction.createQueryBuilder(Ledger, 'ledger')
          .insert()
          .values([
            { accountId: usdAccount.id, value: usdAccount.balance },
            { accountId: eurAccount.id, value: eurAccount.balance }
          ])
          .execute()

        user.accounts = [usdAccount, eurAccount]
      })
    } catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('unique constraint')) {
        throw new ConflictException('User already registered')
      }
      throw error
    }

    const token = await this.jwtService.signAsync({ id: user.id, name: user.name })

    return { user, token }
  }

  async getMe(userId: number) {
    return this.userRepo.createQueryBuilder('user')
      .where({ id: userId })
      .leftJoinAndMapMany('user.accounts', Account, 'account', `account."userId" = "user".id`)
      .getOne()

  }
}
