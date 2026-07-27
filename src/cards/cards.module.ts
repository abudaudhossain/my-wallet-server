import { Module } from '@nestjs/common';
import { AuthModule } from 'src/iam/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CardController } from './card.controller';
import { CardRepository } from './card.repository';
import { CardService } from './card.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CardController],
  providers: [CardService, CardRepository],
  exports: [CardService],
})
export class CardsModule {}
