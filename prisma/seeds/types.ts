import type { TransactionType } from '../../src/generated/prisma/client';

export type SeedUser = {
  id: number;
  email: string;
};

export type SeedCard = {
  id: number;
  userId: number;
  balance: number;
};

export type UserSeedResult = {
  existingReused: number;
  newlyCreated: number;
  users: SeedUser[];
};

export type CardSeedResult = {
  existingReused: number;
  newlyCreated: number;
  cards: SeedCard[];
};

export type TransactionSeedResult = {
  transactionsCreated: number;
};

export type SeedSummary = {
  existingUsersReused: number;
  newUsersCreated: number;
  existingCardsReused: number;
  newCardsCreated: number;
  transactionsCreated: number;
  executionTimeMs: number;
};

export type GeneratedTransaction = {
  type: TransactionType;
  amount: number;
  narration: string;
  date: Date;
  cardId: number;
  userId: number;
};
