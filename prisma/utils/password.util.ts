import * as argon2 from 'argon2';

/** Matches PasswordService hashing options (argon2id). */
export async function hashSeedPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
}
