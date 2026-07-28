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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CurrentUser } from 'src/iam/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/iam/auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from 'src/iam/auth/interfaces/jwt-payload.interface';
import { TRANSACTION_MESSAGES } from './constants/transaction.constants';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CurrentStatusSummaryQueryDto } from './dto/current-status-summary-query.dto';
import { CurrentStatusSummaryResponseDto } from './dto/current-status-summary-response.dto';
import { FindTransactionsQueryDto } from './dto/find-transactions-query.dto';
import { MonthlySummaryListQueryDto } from './dto/monthly-summary-list-query.dto';
import { MonthlySummaryQueryDto } from './dto/monthly-summary-query.dto';
import { MonthlySummaryResponseDto } from './dto/monthly-summary-response.dto';
import { PaginatedTransactionsResponseDto } from './dto/paginated-transactions-response.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { WeeklySummaryListQueryDto } from './dto/weekly-summary-list-query.dto';
import { WeeklySummaryQueryDto } from './dto/weekly-summary-query.dto';
import { WeeklySummaryResponseDto } from './dto/weekly-summary-response.dto';
import { TransactionService } from './transaction.service';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  @ResponseMessage(TRANSACTION_MESSAGES.CREATED)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.create(user.id, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List transactions for the current user' })
  @ApiOkResponse({ type: PaginatedTransactionsResponseDto })
  @ResponseMessage(TRANSACTION_MESSAGES.FETCHED_ALL)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FindTransactionsQueryDto,
  ) {
    return this.transactionService.findAll(user.id, query);
  }

  @Get('summary/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current status summary (total deposit, expense, and balance)',
  })
  @ApiOkResponse({ type: CurrentStatusSummaryResponseDto })
  @ResponseMessage(TRANSACTION_MESSAGES.CURRENT_STATUS_SUMMARY_FETCHED)
  getCurrentStatusSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: CurrentStatusSummaryQueryDto,
  ) {
    return this.transactionService.getCurrentStatusSummary(user.id, query);
  }

  @Get('summary/monthly/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List monthly deposit, expense, and net balance summaries',
  })
  @ApiOkResponse({ type: MonthlySummaryResponseDto, isArray: true })
  @ResponseMessage(TRANSACTION_MESSAGES.MONTHLY_SUMMARY_LIST_FETCHED)
  getMonthlySummaryList(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: MonthlySummaryListQueryDto,
  ) {
    return this.transactionService.getMonthlySummaryList(user.id, query);
  }

  @Get('summary/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get monthly deposit, expense, and net balance summary',
  })
  @ApiOkResponse({ type: MonthlySummaryResponseDto })
  @ResponseMessage(TRANSACTION_MESSAGES.MONTHLY_SUMMARY_FETCHED)
  getMonthlySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: MonthlySummaryQueryDto,
  ) {
    return this.transactionService.getMonthlySummary(user.id, query);
  }

  @Get('summary/weekly/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List weekly deposit, expense, and net balance summaries',
  })
  @ApiOkResponse({ type: WeeklySummaryResponseDto, isArray: true })
  @ResponseMessage(TRANSACTION_MESSAGES.WEEKLY_SUMMARY_LIST_FETCHED)
  getWeeklySummaryList(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: WeeklySummaryListQueryDto,
  ) {
    return this.transactionService.getWeeklySummaryList(user.id, query);
  }

  @Get('summary/weekly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get weekly deposit, expense, and net balance summary',
  })
  @ApiOkResponse({ type: WeeklySummaryResponseDto })
  @ResponseMessage(TRANSACTION_MESSAGES.WEEKLY_SUMMARY_FETCHED)
  getWeeklySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: WeeklySummaryQueryDto,
  ) {
    return this.transactionService.getWeeklySummary(user.id, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ResponseMessage(TRANSACTION_MESSAGES.FETCHED)
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transactionService.findOne(user.id, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiOkResponse({ type: TransactionResponseDto })
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
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiOkResponse({ description: 'Transaction deleted successfully' })
  @ResponseMessage(TRANSACTION_MESSAGES.DELETED)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transactionService.remove(user.id, id);
  }
}
