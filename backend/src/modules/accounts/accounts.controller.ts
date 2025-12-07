import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
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

  @Get('/:id/balance')
  @UserOnly()
  getBalance(@Param('id', new ParseUUIDPipe()) accountId: string) {
    return this.accountsService.getBalance(accountId)
  }
}
