import { Card } from 'src/generated/prisma/client';
import { CardResponseDto } from '../dto/card-response.dto';

export class CardMapper {
  static toResponse(card: Card): CardResponseDto {
    return {
      id: card.id,
      name: card.name,
      description: card.description,
      balance: card.balance.toString(),
      userId: card.userId,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }

  static toResponseList(cards: Card[]): CardResponseDto[] {
    return cards.map((card) => this.toResponse(card));
  }
}
