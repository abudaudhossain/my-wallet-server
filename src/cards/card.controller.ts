import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CurrentUser } from 'src/iam/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/iam/auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from 'src/iam/auth/interfaces/jwt-payload.interface';
import { CardService } from './card.service';
import { CARD_MESSAGES } from './constants/card.constants';
import { CardResponseDto } from './dto/card-response.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@ApiTags('Cards')
@ApiBearerAuth('access-token')
@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a card' })
  @ApiCreatedResponse({ type: CardResponseDto })
  @ResponseMessage(CARD_MESSAGES.CREATED)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCardDto,
  ) {
    return this.cardService.create(user.id, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all cards for the current user' })
  @ApiOkResponse({ type: CardResponseDto, isArray: true })
  @ResponseMessage(CARD_MESSAGES.FETCHED_ALL)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.cardService.findAll(user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a card by ID' })
  @ApiOkResponse({ type: CardResponseDto })
  @ResponseMessage(CARD_MESSAGES.FETCHED)
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cardService.findOne(user.id, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a card' })
  @ApiOkResponse({ type: CardResponseDto })
  @ResponseMessage(CARD_MESSAGES.UPDATED)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cardService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a card' })
  @ApiOkResponse({ description: 'Card deleted successfully' })
  @ResponseMessage(CARD_MESSAGES.DELETED)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cardService.remove(user.id, id);
  }
}
