import { Transaction } from './transaction.model';

/**
 * Case-insensitive, whitespace-tolerant category search that is safe for null categories.
 *
 * Returns the original array when there is no query, so a `computed()` built on top of it
 * keeps the same reference and nothing downstream re-renders.
 */
export function filterTransactions(
  transactions: readonly Transaction[],
  query: string,
): readonly Transaction[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) {
    return transactions;
  }
  return transactions.filter((t) => (t.category ?? '').toLocaleLowerCase().includes(needle));
}
