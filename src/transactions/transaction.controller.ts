import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CurrentUser } from 'src/iam/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/iam/auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from 'src/iam/auth/interfaces/jwt-payload.interface';
import { TRANSACTION_MESSAGES } from './constants/transaction.constants';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionService } from './transaction.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(TRANSACTION_MESSAGES.CREATED)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.create(user.id, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(TRANSACTION_MESSAGES.FETCHED_ALL)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('cardId', new ParseIntPipe({ optional: true })) cardId?: number,
  ) {
    return this.transactionService.findAll(user.id, cardId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(TRANSACTION_MESSAGES.FETCHED)
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transactionService.findOne(user.id, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(TRANSACTION_MESSAGES.UPDATED)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(TRANSACTION_MESSAGES.DELETED)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transactionService.remove(user.id, id);
  }
}
