import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, TrackByFunction, computed, inject, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { filterTransactions } from './filter-transactions';
import { TransactionApi } from './transaction-api';
import { Transaction } from './transaction.model';
import { TransactionRow } from './transaction-row';
import { Icon } from '../shared/icon';

const SEARCH_DEBOUNCE_MS = 250;

/**
 * The fixed version of the broken `TransactionsComponent` from Part A.
 * See docs/part-a.md for the reasoning behind each change.
 */
@Component({
  selector: 'app-transaction-list',
  host: { class: 'block' },
  imports: [ScrollingModule, TransactionRow, Icon],
  templateUrl: './transaction-list.html',
})
export class TransactionList {
  private readonly api = inject(TransactionApi);

  /** The single source of truth. Angular owns the subscription and tracks loading and errors. */
  protected readonly transactions = rxResource({ stream: () => this.api.getTransactions() });

  /** Raw input, updated on every keystroke. Cheap, because nothing heavy reads it. */
  protected readonly query = signal('');

  /** What the list actually filters on: settled, trimmed and de-duplicated. */
  protected readonly searchTerm = toSignal(
    toObservable(this.query).pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      map((q) => q.trim()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  private readonly all = computed(() =>
    this.transactions.hasValue() ? this.transactions.value() : [],
  );

  /** Derived, never stored, so it can't drift out of sync with the data or the query. */
  protected readonly filtered = computed(() => filterTransactions(this.all(), this.searchTerm()));
  protected readonly total = computed(() => this.all().length);

  protected readonly trackById: TrackByFunction<Transaction> = (_, t) => t.id;
}
