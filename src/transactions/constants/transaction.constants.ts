export const TRANSACTION_MESSAGES = {
  CREATED: 'Transaction created successfully',
  UPDATED: 'Transaction updated successfully',
  DELETED: 'Transaction deleted successfully',
  FETCHED: 'Transaction fetched successfully',
  FETCHED_ALL: 'Transactions fetched successfully',
  WEEKLY_SUMMARY_FETCHED: 'Weekly transaction summary fetched successfully',
  NOT_FOUND: 'Transaction not found',
  CARD_NOT_FOUND: 'Card not found',
  INSUFFICIENT_BALANCE: 'Insufficient card balance',
  INVALID_DATE_RANGE: 'From date must be before or equal to to date',
} as const;
