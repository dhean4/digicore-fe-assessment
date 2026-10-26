import { filterTransactions } from './filter-transactions';
import { Transaction } from './transaction.model';

const tx = (id: string, category: string | null): Transaction => ({
  id,
  category,
  narration: '',
  amountMinor: 100,
  currency: 'NGN',
  direction: 'debit',
  postedAt: '2026-10-26T00:00:00.000Z',
});

describe('filterTransactions', () => {
  const data = [tx('1', 'Airtime'), tx('2', 'Bills'), tx('3', null), tx('4', 'ATM Withdrawal')];

  it('returns the same array reference for an empty or whitespace query', () => {
    expect(filterTransactions(data, '')).toBe(data);
    expect(filterTransactions(data, '   ')).toBe(data);
  });

  it('matches case-insensitively and ignores surrounding whitespace', () => {
    expect(filterTransactions(data, '  aIr ').map((t) => t.id)).toEqual(['1']);
  });

  it('does not throw on a null category', () => {
    expect(filterTransactions(data, 'atm').map((t) => t.id)).toEqual(['4']);
  });
});
