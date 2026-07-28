function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

export const seedConfig = {
  usersToCreate: parsePositiveInt(process.env.USERS_TO_CREATE, 10),
  cardsPerUser: parsePositiveInt(process.env.CARDS_PER_USER, 1),
  minTransactionsPerCard: parsePositiveInt(
    process.env.MIN_TRANSACTIONS_PER_CARD,
    50,
  ),
  maxTransactionsPerCard: parsePositiveInt(
    process.env.MAX_TRANSACTIONS_PER_CARD,
    200,
  ),
  transactionMonthsBack: parsePositiveInt(
    process.env.TRANSACTION_MONTHS_BACK,
    3,
  ),
  batchSize: parsePositiveInt(process.env.SEED_BATCH_SIZE, 1000),
  cardGroupSize: parsePositiveInt(process.env.SEED_CARD_GROUP_SIZE, 50),
  userPassword: process.env.SEED_USER_PASSWORD ?? 'Password123!',
} as const;

if (
  seedConfig.minTransactionsPerCard > seedConfig.maxTransactionsPerCard
) {
  throw new Error(
    'MIN_TRANSACTIONS_PER_CARD cannot be greater than MAX_TRANSACTIONS_PER_CARD',
  );
}
