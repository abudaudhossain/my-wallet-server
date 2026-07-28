import type { PrismaClient } from '../../src/generated/prisma/client';
import { seedConfig } from './config';
import type { CardSeedResult, SeedCard, SeedUser } from './types';
import { buildSeedCard } from '../utils/faker.util';
import { chunk } from '../utils/chunk.util';

export class CardSeeder {
  constructor(private readonly prisma: PrismaClient) {}

  async seed(users: SeedUser[]): Promise<CardSeedResult> {
    if (users.length === 0) {
      console.log('[CardSeeder] No users available; skipping');
      return { existingReused: 0, newlyCreated: 0, cards: [] };
    }

    const userIds = users.map((user) => user.id);
    const existingCards = await this.prisma.card.findMany({
      where: { userId: { in: userIds } },
      select: { id: true, userId: true },
    });

    const countByUser = new Map<number, number>();
    for (const card of existingCards) {
      countByUser.set(card.userId, (countByUser.get(card.userId) ?? 0) + 1);
    }

    const target = seedConfig.cardsPerUser;
    const cardsToCreate: Array<{
      name: string;
      description: string;
      userId: number;
    }> = [];

    for (const user of users) {
      const existing = countByUser.get(user.id) ?? 0;
      const shortfall = Math.max(0, target - existing);

      for (let i = 0; i < shortfall; i++) {
        const profile = buildSeedCard(existing + i);
        cardsToCreate.push({
          name: profile.name,
          description: profile.description,
          userId: user.id,
        });
      }
    }

    console.log(
      `[CardSeeder] Existing cards: ${existingCards.length}; creating ${cardsToCreate.length}`,
    );

    let newlyCreated = 0;
    for (const batch of chunk(cardsToCreate, seedConfig.batchSize)) {
      const result = await this.prisma.card.createMany({ data: batch });
      newlyCreated += result.count;
    }

    const cardsRaw = await this.prisma.card.findMany({
      where: { userId: { in: userIds } },
      select: { id: true, userId: true, balance: true },
      orderBy: { id: 'asc' },
    });

    const cards: SeedCard[] = cardsRaw.map((card) => ({
      id: card.id,
      userId: card.userId,
      balance: Number(card.balance.toString()),
    }));

    const existingReused = cards.length - newlyCreated;

    console.log(
      `[CardSeeder] Reused ${existingReused}; created ${newlyCreated}; total ${cards.length}`,
    );

    return {
      existingReused,
      newlyCreated,
      cards,
    };
  }
}
