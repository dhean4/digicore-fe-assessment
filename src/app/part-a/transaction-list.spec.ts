import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { TransactionApi } from './transaction-api';
import { TransactionList } from './transaction-list';
import { Transaction } from './transaction.model';

const data: Transaction[] = [
  {
    id: '1',
    category: 'Airtime',
    narration: 'MTN',
    amountMinor: 50_000,
    currency: 'NGN',
    direction: 'debit',
    postedAt: '2026-10-25T10:00:00Z',
  },
  {
    id: '2',
    category: 'Salary',
    narration: 'Acme',
    amountMinor: 900_000_00,
    currency: 'NGN',
    direction: 'credit',
    postedAt: '2026-10-24T10:00:00Z',
  },
  {
    id: '3',
    category: null,
    narration: 'Pending',
    amountMinor: 1_000,
    currency: 'NGN',
    direction: 'debit',
    postedAt: '2026-10-23T10:00:00Z',
  },
];

async function render(source: () => Observable<Transaction[]>) {
  TestBed.configureTestingModule({
    imports: [TransactionList],
    providers: [{ provide: TransactionApi, useValue: { getTransactions: source } }],
  });
  const fixture = TestBed.createComponent(TransactionList);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('TransactionList', () => {
  it('shows how many transactions loaded', async () => {
    const { el } = await render(() => of(data));
    expect(el.querySelector('.count')?.textContent).toContain('3 of 3 transactions');
  });

  it('filters after the debounce, case-insensitively', async () => {
    const { fixture, el } = await render(() => of(data));
    const input = el.querySelector<HTMLInputElement>('input[type="search"]')!;

    input.value = 'SAL';
    input.dispatchEvent(new Event('input'));
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fixture.whenStable();

    expect(el.querySelector('.count')?.textContent).toContain('1 of 3 transactions');
  });

  it('shows an error with a retry button instead of an empty list', async () => {
    const { el } = await render(() => throwError(() => new Error('500')));
    expect(el.querySelector('[role="alert"]')?.textContent).toContain("couldn't load");
    expect(el.querySelector('[role="alert"] button')).not.toBeNull();
  });

  it('shows an empty state when there is no history', async () => {
    const { el } = await render(() => of([]));
    expect(el.textContent).toContain("You don't have any transactions yet.");
  });
});
