import type { PrismaClient } from '../../src/generated/prisma/client';
import { UserStatus } from '../../src/generated/prisma/client';
import { ROLES } from '../../src/iam/seeds/role';
import { seedConfig } from './config';
import type { SeedUser, UserSeedResult } from './types';
import { buildSeedUserProfile } from '../utils/faker.util';
import { hashSeedPassword } from '../utils/password.util';
import { chunk } from '../utils/chunk.util';

export class UserSeeder {
  constructor(private readonly prisma: PrismaClient) {}

  async seed(): Promise<UserSeedResult> {
    const existingCount = await this.prisma.user.count();

    if (existingCount > 0) {
      const users = await this.prisma.user.findMany({
        select: { id: true, email: true },
        orderBy: { id: 'asc' },
      });

      console.log(
        `[UserSeeder] Reusing ${users.length} existing user(s); skipping create`,
      );

      return {
        existingReused: users.length,
        newlyCreated: 0,
        users,
      };
    }

    const role = await this.prisma.role.findUnique({
      where: { key: ROLES.USER },
      select: { id: true },
    });

    if (!role) {
      throw new Error(
        `Role "${ROLES.USER}" not found. Run permissions/roles seed first.`,
      );
    }

    const passwordHash = await hashSeedPassword(seedConfig.userPassword);
    const toCreate = seedConfig.usersToCreate;

    console.log(`[UserSeeder] No users found; creating ${toCreate} user(s)`);

    const payloads = Array.from({ length: toCreate }, (_, index) => {
      const profile = buildSeedUserProfile(index);
      return {
        name: profile.name,
        email: profile.email,
        designation: profile.designation,
        password: passwordHash,
        status: UserStatus.ACTIVE,
        isVerified: true,
        roleId: role.id,
      };
    });

    let newlyCreated = 0;
    for (const batch of chunk(payloads, seedConfig.batchSize)) {
      const result = await this.prisma.user.createMany({ data: batch });
      newlyCreated += result.count;
    }

    const users: SeedUser[] = await this.prisma.user.findMany({
      select: { id: true, email: true },
      orderBy: { id: 'asc' },
    });

    console.log(`[UserSeeder] Created ${newlyCreated} user(s)`);

    return {
      existingReused: 0,
      newlyCreated,
      users,
    };
  }
}
