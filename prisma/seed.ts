import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { seedPermissionsAndRoles } from '../src/iam/seeds/permission.seed';
import { UserSeeder } from './seeds/user.seed';
import { CardSeeder } from './seeds/card.seed';
import { TransactionSeeder } from './seeds/transaction.seed';
import type { SeedSummary } from './seeds/types';
import { seedConfig } from './seeds/config';

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

function printSummary(summary: SeedSummary): void {
  console.log('\n========== Seed Summary ==========');
  console.log(`Existing users reused: ${summary.existingUsersReused}`);
  console.log(`New users created: ${summary.newUsersCreated}`);
  console.log(`Existing cards reused: ${summary.existingCardsReused}`);
  console.log(`New cards created: ${summary.newCardsCreated}`);
  console.log(`Transactions created: ${summary.transactionsCreated}`);
  console.log(`Execution time: ${formatDuration(summary.executionTimeMs)}`);
  console.log('==================================\n');
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const startedAt = Date.now();
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('[Seed] Starting database seed');
    console.log(
      `[Seed] Config: users=${seedConfig.usersToCreate}, cardsPerUser=${seedConfig.cardsPerUser}, txs=[${seedConfig.minTransactionsPerCard},${seedConfig.maxTransactionsPerCard}], monthsBack=${seedConfig.transactionMonthsBack}, batchSize=${seedConfig.batchSize}`,
    );

    console.log('[Seed] Seeding permissions and roles...');
    await seedPermissionsAndRoles(prisma);
    console.log('[Seed] Permissions and roles ready');

    const userSeeder = new UserSeeder(prisma);
    const cardSeeder = new CardSeeder(prisma);
    const transactionSeeder = new TransactionSeeder(prisma);

    console.log('[Seed] Seeding users...');
    const userResult = await userSeeder.seed();

    console.log('[Seed] Seeding cards...');
    const cardResult = await cardSeeder.seed(userResult.users);

    console.log('[Seed] Seeding transactions...');
    const txResult = await transactionSeeder.seed(cardResult.cards);

    printSummary({
      existingUsersReused: userResult.existingReused,
      newUsersCreated: userResult.newlyCreated,
      existingCardsReused: cardResult.existingReused,
      newCardsCreated: cardResult.newlyCreated,
      transactionsCreated: txResult.transactionsCreated,
      executionTimeMs: Date.now() - startedAt,
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('[Seed] Failed:', error);
  process.exit(1);
});
