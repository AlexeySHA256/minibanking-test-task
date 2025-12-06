import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { GetTransactionsRequestDto, GetTransactionsResponseDto } from './dto/list.dto';
import { Serialize } from '@/common/decorators/serialize.decorator';
import { ExchangeDto } from './dto/exchange.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('transactions')
export class TransactionsController {
  @Inject() transactionsService: TransactionsService

  @Post('/exchange')
  exchange(@Body() dto: ExchangeDto) {
    return this.transactionsService.exchange(dto)
  }

  @Post('/transfer')
  transfer(@Body() dto: TransferDto) {
    return this.transactionsService.transfer(dto)
  }

  @Get()
  @Serialize(GetTransactionsResponseDto)
  getList(@Query() dto: GetTransactionsRequestDto) {
    return this.transactionsService.getList(dto)
  }
}
