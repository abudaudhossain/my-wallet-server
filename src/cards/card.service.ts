import { Injectable, NotFoundException } from '@nestjs/common';
import { CARD_MESSAGES } from './constants/card.constants';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardMapper } from './mappers/card.mapper';
import { CardRepository } from './card.repository';

@Injectable()
export class CardService {
  constructor(private readonly cardRepository: CardRepository) {}

  async create(userId: number, dto: CreateCardDto) {
    const card = await this.cardRepository.create({
      name: dto.name,
      description: dto.description,
      user: { connect: { id: userId } },
    });

    return CardMapper.toResponse(card);
  }

  async findAll(userId: number) {
    const cards = await this.cardRepository.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return CardMapper.toResponseList(cards);
  }

  async findOne(userId: number, id: number) {
    const card = await this.findOwnedCard(userId, id);
    return CardMapper.toResponse(card);
  }

  async update(userId: number, id: number, dto: UpdateCardDto) {
    await this.findOwnedCard(userId, id);

    const card = await this.cardRepository.update(
      { id },
      {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    );

    return CardMapper.toResponse(card);
  }

  async remove(userId: number, id: number) {
    await this.findOwnedCard(userId, id);
    await this.cardRepository.delete({ id });
    return null;
  }

  private async findOwnedCard(userId: number, id: number) {
    const card = await this.cardRepository.findFirst({ id, userId });

    if (!card) {
      throw new NotFoundException(CARD_MESSAGES.NOT_FOUND);
    }

    return card;
  }
}
