import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
  GetTransactionsRequestDto,
  GetTransactionsResponseDto,
  TransactionDto,
} from './dto/list.dto';
import { Serialize } from '@/common/decorators/serialize.decorator';
import { ExchangeDto } from './dto/exchange.dto';
import { TransferDto } from './dto/transfer.dto';
import { UserOnly } from '@/common/guards/user-only.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthPayload } from '@/common/types';

@Controller('transactions')
export class TransactionsController {
  @Inject() transactionsService: TransactionsService;

  @Post('/exchange')
  @Serialize(TransactionDto)
  @UserOnly()
  exchange(@Body() dto: ExchangeDto, @CurrentUser() user: AuthPayload) {
    return this.transactionsService.exchange(dto, user.id);
  }

  @Post('/transfer')
  @Serialize(TransactionDto)
  @UserOnly()
  transfer(@Body() dto: TransferDto, @CurrentUser() user: AuthPayload) {
    return this.transactionsService.transfer(dto, user.id);
  }

  @Get()
  @Serialize(GetTransactionsResponseDto)
  @UserOnly()
  getList(
    @Query() dto: GetTransactionsRequestDto,
    @CurrentUser() user: AuthPayload,
  ) {
    return this.transactionsService.getList(dto, user.id);
  }
}
