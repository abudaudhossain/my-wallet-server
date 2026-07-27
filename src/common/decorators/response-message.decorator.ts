import { SetMetadata } from '@nestjs/common';
import { RESPONSE_MESSAGE } from '../constants';

export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);
