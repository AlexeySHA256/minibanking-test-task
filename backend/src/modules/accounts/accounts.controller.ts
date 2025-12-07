import { BadRequestException, Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { UserOnly } from '@/common/guards/user-only.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthPayload } from '@/common/types';

@Controller('accounts')
export class AccountsController {
  @Inject() accountsService: AccountsService

  @Get()
  @UserOnly()
  getList(@CurrentUser() user: AuthPayload) {
    return this.accountsService.getList(user.id)
  }

  @Get('/exchange-rate/:key')
  getExchangeRate(@Param('key') key: string) {
    if (key.split(":").length !== 2) throw new BadRequestException("Key should have format: '[from]:[to]', where 'from' and 'to' are corresponding currencies names")
    return this.accountsService.getExchangeRate(key)
  }

  @Get('/currencies')
  getCurrencies() {
    return this.accountsService.getCurrencies()
  }

  @Get('/:id/balance')
  @UserOnly()
  getBalance(@Param('id', new ParseUUIDPipe()) accountId: string) {
    return this.accountsService.getBalance(accountId)
  }
}
