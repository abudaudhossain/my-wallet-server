import type { PrismaClient } from '../../src/generated/prisma/client';
import { TransactionType } from '../../src/generated/prisma/client';
import { seedConfig } from './config';
import type {
  GeneratedTransaction,
  SeedCard,
  TransactionSeedResult,
} from './types';
import {
  buildTransactionNarration,
  faker,
  randomTransactionAmount,
  randomTransactionType,
} from '../utils/faker.util';
import { randomDateWithinMonths } from '../utils/random-date.util';
import { chunk } from '../utils/chunk.util';

type CardPlan = {
  card: SeedCard;
  transactions: GeneratedTransaction[];
  finalBalance: number;
};

export class TransactionSeeder {
  constructor(private readonly prisma: PrismaClient) {}

  async seed(cards: SeedCard[]): Promise<TransactionSeedResult> {
    if (cards.length === 0) {
      console.log('[TransactionSeeder] No cards available; skipping');
      return { transactionsCreated: 0 };
    }

    const plans = cards.map((card) => this.buildCardPlan(card));
    const totalPlanned = plans.reduce(
      (sum, plan) => sum + plan.transactions.length,
      0,
    );

    console.log(
      `[TransactionSeeder] Generating ${totalPlanned} transaction(s) across ${cards.length} card(s)`,
    );

    let transactionsCreated = 0;
    const cardGroups = chunk(plans, seedConfig.cardGroupSize);

    for (const [groupIndex, group] of cardGroups.entries()) {
      const groupTxs = group.flatMap((plan) => plan.transactions);
      const txChunks = chunk(groupTxs, seedConfig.batchSize);

      await this.prisma.$transaction(async (tx) => {
        for (const batch of txChunks) {
          const result = await tx.transaction.createMany({
            data: batch.map((row) => ({
              type: row.type,
              amount: row.amount,
              narration: row.narration,
              date: row.date,
              cardId: row.cardId,
              userId: row.userId,
            })),
          });
          transactionsCreated += result.count;
        }

        for (const plan of group) {
          await tx.card.update({
            where: { id: plan.card.id },
            data: { balance: plan.finalBalance },
          });
        }
      });

      console.log(
        `[TransactionSeeder] Card group ${groupIndex + 1}/${cardGroups.length} committed (${group.length} card(s))`,
      );
    }

    console.log(
      `[TransactionSeeder] Created ${transactionsCreated} transaction(s)`,
    );

    return { transactionsCreated };
  }

  private buildCardPlan(card: SeedCard): CardPlan {
    const count = faker.number.int({
      min: seedConfig.minTransactionsPerCard,
      max: seedConfig.maxTransactionsPerCard,
    });

    const raw: GeneratedTransaction[] = Array.from({ length: count }, () => {
      const type = randomTransactionType();
      return {
        type,
        amount: randomTransactionAmount(type),
        narration: buildTransactionNarration(type),
        date: randomDateWithinMonths(seedConfig.transactionMonthsBack),
        cardId: card.id,
        userId: card.userId,
      };
    });

    raw.sort((a, b) => a.date.getTime() - b.date.getTime());

    let balance = card.balance;
    const transactions: GeneratedTransaction[] = [];

    for (const row of raw) {
      let { type, amount, narration } = row;

      if (type === TransactionType.EXPENSE && balance - amount < 0) {
        // Prefer converting to a deposit so history stays realistic and balance-safe.
        type = TransactionType.DEPOSIT;
        amount = randomTransactionAmount(TransactionType.DEPOSIT);
        narration = buildTransactionNarration(TransactionType.DEPOSIT);
      }

      const signed =
        type === TransactionType.DEPOSIT ? amount : -amount;
      balance = Math.round((balance + signed) * 100) / 100;

      transactions.push({
        ...row,
        type,
        amount,
        narration,
      });
    }

    return {
      card,
      transactions,
      finalBalance: balance,
    };
  }
}
