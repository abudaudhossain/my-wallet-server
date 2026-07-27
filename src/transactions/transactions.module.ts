import { Module } from '@nestjs/common';
import { AuthModule } from 'src/iam/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransactionController } from './transaction.controller';
import { TransactionRepository } from './transaction.repository';
import { TransactionService } from './transaction.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository],
  exports: [TransactionService],
})
export class TransactionsModule {}
