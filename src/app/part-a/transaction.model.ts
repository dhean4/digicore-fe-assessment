export type TransactionDirection = 'credit' | 'debit';

export interface Transaction {
  id: string;
  /** Legacy and pending records can arrive without a category, so the type says so. */
  category: string | null;
  narration: string;
  /** Integer minor units (kobo). Money is never stored as a float. */
  amountMinor: number;
  currency: string;
  direction: TransactionDirection;
  /** ISO-8601 timestamp. */
  postedAt: string;
}
