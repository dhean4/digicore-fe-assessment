import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Transaction } from './transaction.model';

/**
 * In production this wraps HttpClient and calls a paginated endpoint that filters on the
 * server, e.g. `GET /accounts/:id/transactions?q=&cursor=`. A customer with years of history
 * should never have to download every transaction to search them. It is mocked here so the
 * demo runs without a backend.
 */
@Injectable({ providedIn: 'root' })
export class TransactionApi {
  getTransactions(): Observable<Transaction[]> {
    return of(mockTransactions()).pipe(delay(400));
  }
}

const CATEGORIES = [
  'Airtime',
  'Transfer',
  'POS Purchase',
  'Bills',
  'Salary',
  'ATM Withdrawal',
  'Card Payment',
  'Interest',
  null,
];
const NARRATIONS = [
  'MTN NG',
  'To A. Okafor',
  'Shoprite Lekki',
  'IKEDC Prepaid',
  'Acme Ltd',
  'GTW ATM',
];

let cache: Transaction[] | undefined;

/** 5,000 deterministic transactions, enough to make rendering cost visible. */
function mockTransactions(count = 5_000): Transaction[] {
  if (cache) {
    return cache;
  }
  let seed = 42;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const start = Date.UTC(2026, 9, 26);

  cache = Array.from({ length: count }, (_, i) => {
    const category = CATEGORIES[Math.floor(random() * CATEGORIES.length)];
    return {
      id: `txn_${(i + 1).toString().padStart(5, '0')}`,
      category,
      narration: NARRATIONS[Math.floor(random() * NARRATIONS.length)],
      amountMinor: Math.round(random() * 50_000_00),
      currency: 'NGN',
      direction: category === 'Salary' || category === 'Interest' ? 'credit' : 'debit',
      postedAt: new Date(start - i * 3_600_000 * 7).toISOString(),
    };
  });
  return cache;
}
