export const TRANSACTION_MESSAGES = {
  CREATED: 'Transaction created successfully',
  UPDATED: 'Transaction updated successfully',
  DELETED: 'Transaction deleted successfully',
  FETCHED: 'Transaction fetched successfully',
  FETCHED_ALL: 'Transactions fetched successfully',
  WEEKLY_SUMMARY_FETCHED: 'Weekly transaction summary fetched successfully',
  WEEKLY_SUMMARY_LIST_FETCHED:
    'Weekly transaction summary list fetched successfully',
  MONTHLY_SUMMARY_FETCHED: 'Monthly transaction summary fetched successfully',
  MONTHLY_SUMMARY_LIST_FETCHED:
    'Monthly transaction summary list fetched successfully',
  CURRENT_STATUS_SUMMARY_FETCHED:
    'Current status summary fetched successfully',
  NOT_FOUND: 'Transaction not found',
  CARD_NOT_FOUND: 'Card not found',
  INSUFFICIENT_BALANCE: 'Insufficient card balance',
  INVALID_DATE_RANGE: 'From date must be before or equal to to date',
} as const;
