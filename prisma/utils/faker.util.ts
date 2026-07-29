import { faker } from '@faker-js/faker';
import { TransactionType } from '../../src/generated/prisma/client';

export { faker };

const CARD_NAMES = [
  'Everyday Spending',
  'Savings Vault',
  'Travel Fund',
  'Bills & Utilities',
  'Emergency Buffer',
  'Shopping Card',
  'Business Expenses',
  'Investment Float',
] as const;

const DEPOSIT_DESCRIPTIONS = [
  'Salary deposit',
  'Freelance payment',
  'Refund received',
  'Transfer from savings',
  'Interest credit',
  'Cashback reward',
  'Client invoice paid',
  'Gift received',
] as const;

const EXPENSE_DESCRIPTIONS = [
  'Grocery shopping',
  'Restaurant bill',
  'Fuel purchase',
  'Online subscription',
  'Utility payment',
  'Ride sharing',
  'Pharmacy',
  'Clothing purchase',
  'Mobile top-up',
  'Streaming service',
] as const;

export function buildSeedUserProfile(index: number): {
  name: string;
  email: string;
  designation: string;
} {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const localPart = `${firstName}.${lastName}.${index}`
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '');

  return {
    name: `${firstName} ${lastName}`,
    email: `${localPart}@seed.local`,
    designation: faker.person.jobTitle(),
  };
}

export function buildSeedCard(index: number): {
  name: string;
  description: string;
  lastFour: string;
  expires: string;
  network: string;
  colors: string;
} {
  const base =
    CARD_NAMES[index % CARD_NAMES.length] ??
    faker.finance.accountName();

  return {
    name: index < CARD_NAMES.length ? base : `${base} ${index + 1}`,
    description: faker.lorem.sentence(),
    lastFour: faker.string.numeric(4),
    expires: faker.date
      .future({ years: 5 })
      .toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }),
    network: faker.helpers.arrayElement(['Visa', 'Mastercard', 'Amex']),
    colors: faker.helpers.arrayElement([
      "from-violet-400 via-purple-400 to-fuchsia-400",
      "from-cyan-400 via-sky-400 to-blue-500",
      "from-lime-300 via-emerald-400 to-teal-500",
      "from-rose-400 via-orange-400 to-amber-300",
      "from-pink-400 via-rose-500 to-red-500",
      "from-blue-400 via-indigo-500 to-violet-600",
      "from-teal-300 via-cyan-400 to-sky-500",
      "from-yellow-300 via-amber-400 to-orange-500",
      "from-slate-300 via-slate-400 to-slate-600",
      "from-indigo-700 via-purple-700 to-slate-900"
    ]),
  };
}

export function randomTransactionType(): TransactionType {
  // Slight deposit bias keeps running balances healthier when seeding.
  return Math.random() < 0.45
    ? TransactionType.DEPOSIT
    : TransactionType.EXPENSE;
}

export function randomTransactionAmount(type: TransactionType): number {
  const amount =
    type === TransactionType.DEPOSIT
      ? faker.number.float({ min: 50, max: 2000, fractionDigits: 2 })
      : faker.number.float({ min: 5, max: 500, fractionDigits: 2 });

  return Math.round(amount * 100) / 100;
}

export function buildTransactionNarration(type: TransactionType): string {
  const description =
    type === TransactionType.DEPOSIT
      ? faker.helpers.arrayElement(DEPOSIT_DESCRIPTIONS)
      : faker.helpers.arrayElement(EXPENSE_DESCRIPTIONS);

  const reference = `REF-${faker.string.alphanumeric({
    length: 8,
    casing: 'upper',
  })}`;

  return `${description} · ${reference}`;
}
