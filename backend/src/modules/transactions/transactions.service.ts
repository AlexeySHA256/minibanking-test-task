import { Injectable } from '@nestjs/common';
import { GetTransactionsRequestDto } from './dto/list.dto';
import { TransferDto } from './dto/transfer.dto';
import { ExchangeDto } from './dto/exchange.dto';

@Injectable()
export class TransactionsService {
  async exchange(dto: ExchangeDto) { }

  async transfer(dto: TransferDto) { }

  async getList(dto: GetTransactionsRequestDto) { }
}
