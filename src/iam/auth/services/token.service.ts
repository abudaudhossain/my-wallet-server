import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

export interface GeneratedToken {
  rawToken: string;
  tokenHash: string;
}

@Injectable()
export class TokenService {
  generateOpaqueToken(bytes = 32): GeneratedToken {
    const rawToken = randomBytes(bytes).toString('hex');
    return {
      rawToken,
      tokenHash: this.hashToken(rawToken),
    };
  }

  hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}
