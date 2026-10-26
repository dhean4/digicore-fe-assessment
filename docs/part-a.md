# Part A: Broken Banking Transaction UI

## The original component

```ts
@Component({
  selector: 'app-transactions',
  template: `
    <input (input)="onSearch($event)" placeholder="Search" />

    <div *ngFor="let t of filteredTransactions">
      {{ t.category }} - {{ t.amount }}
    </div>
  `
})
export class TransactionsComponent {
  transactions = [];
  filteredTransactions = [];

  ngOnInit() {
    this.transactionService.getTransactions().subscribe(data => {
      this.transactions = data;
      this.filteredTransactions = data;
    });
  }

  onSearch(event: any) {
    const value = event.target.value;

    this.filteredTransactions = this.transactions.filter(t =>
      t.category.includes(value)
    );
  }
}
```

The fixed version is [`src/app/part-a/transaction-list.ts`](../src/app/part-a/transaction-list.ts),
with its [template](../src/app/part-a/transaction-list.html) and
[tests](../src/app/part-a/transaction-list.spec.ts). To try it, run `npm start` and open `/transactions`.

---

## 1. All the issues

### Breaks in production

| # | Issue | What happens |
|---|---|---|
| 1 | **`transactionService` is never injected.** There's no constructor parameter and no `inject()`. | `this.transactionService` is `undefined`, so `ngOnInit` throws `Cannot read properties of undefined` and nothing renders. Under strict TS it doesn't even compile. |
| 2 | **No error handling on the subscription.** | A failed request (a 500, a timeout, an expired session) leaves the user looking at an empty list that looks exactly like "you have no transactions". In a banking app that is a support ticket at best and a panic at worst. There's no loading state either. |
| 3 | **`t.category.includes(value)` crashes on a null or undefined category.** | Pending, reversed and legacy transactions often come back without a category. The first one throws a `TypeError` inside the input handler, and search stops working. |
| 4 | **`*ngFor` with no `NgFor`/`CommonModule` import.** | Components are standalone by default in modern Angular. With no import, the compiler only raises a warning (NG8103, "missing control flow directive"), the build still passes, and at runtime the list never renders. |
| 5 | **`transactions = []` is typed as `never[]` under `strict`.** | Every later assignment and `.filter(t => t.category)` is a type error. Together with `event: any`, the type system is switched off exactly where the data comes in. |

### Wrong behaviour (state bugs)

| # | Issue | What happens |
|---|---|---|
| 6 | **Duplicated state: `filteredTransactions` is a manual copy of `transactions`.** | Two arrays have to be kept in sync by hand. If the data reloads (a pull-to-refresh, polling, a websocket push), the subscribe callback overwrites `filteredTransactions` with the full list and the search the user typed is silently ignored. The input still shows "airtime", but the list shows everything. |
| 7 | **Case-sensitive, untrimmed search.** | Typing `airtime` doesn't find `Airtime`, and `"Bills "` with a trailing space finds nothing. To users the search just looks broken. |
| 8 | **The amount is shown raw (`{{ t.amount }}`).** | You get `150000` instead of `₦1,500.00`, with no debit or credit sign. If the API sends floats, you also see things like `0.30000000000000004`. Money should be integer minor units, formatted for the locale with the currency pipe. |

### Leaks and performance

| # | Issue | What happens |
|---|---|---|
| 9 | **The subscription is never unsubscribed.** | A one-shot `HttpClient` call completes on its own. But `getTransactions()` is a service method, and the moment it's backed by a store, polling or a websocket (all normal in banking), every visit to this screen leaks a subscription. Each leaked one keeps the destroyed component alive and keeps writing to it. Memory grows and work is duplicated. |
| 10 | **No `trackBy`, and `filter()` always returns a new array.** | On every keystroke Angular can't tell which rows are the same, so it destroys and re-creates the DOM for the whole list. With a few thousand transactions, typing becomes visibly laggy. |
| 11 | **No debounce.** | Filtering and re-rendering happen on every keystroke. Typing "transfer" does that work 8 times, and 7 of them are thrown away. If this ever becomes a server search, it's also 8 requests that can come back out of order. |
| 12 | **Everything is rendered at once.** | Rendering 5,000 rows creates 5,000 or more DOM nodes. That means slow first paint, heavy memory use and janky scrolling on low-end Android devices, which many Nigerian banking customers use. |
| 13 | **Default (`Eager`) change detection with mutable fields.** | Any event anywhere in the app re-checks this component and its whole list. |
| 14 | **The whole history is loaded into the browser and searched there.** | That works for 50 transactions but not for 5 years of a business account. In production, search and pagination belong on the server. |

### Template and accessibility

| # | Issue |
|---|---|
| 15 | The input has no `<label>`. A placeholder isn't a label, so screen readers just announce "edit text". It's also not `type="search"`, so mobile keyboards and the clear button don't behave as users expect. |
| 16 | A `<div>` per row has no list semantics, so assistive tech can't say "list, 5,000 items". |
| 17 | There are no loading, error or empty states. All three look identical: a blank area. |

---

## 2. The fixes

### a. State handling

**One source of truth, plus derived state.** The fetched data and the search term are the only state.
The filtered list is a `computed()`, so it can't drift out of sync and it automatically re-applies the
current search when the data reloads (this fixes #6).

```ts
protected readonly transactions = rxResource({ stream: () => this.api.getTransactions() });
protected readonly query = signal('');

private readonly all = computed(() => (this.transactions.hasValue() ? this.transactions.value() : []));
protected readonly filtered = computed(() => filterTransactions(this.all(), this.searchTerm()));
```

Filtering is a pure, unit-tested function that is case-insensitive, trims the query and is safe for
null categories (#3, #7). With an empty query it returns the **same array reference**, so clearing
the search doesn't re-render anything:

```ts
export function filterTransactions(transactions: readonly Transaction[], query: string) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return transactions;
  return transactions.filter((t) => (t.category ?? '').toLocaleLowerCase().includes(needle));
}
```

The data is typed (#5), and money is in minor units:

```ts
export interface Transaction {
  id: string;
  category: string | null;
  narration: string;
  amountMinor: number;   // kobo, an integer. Never floats for money.
  currency: string;
  direction: 'credit' | 'debit';
  postedAt: string;
}
```

The service comes in through `inject(TransactionApi)` (#1).

### b. Subscriptions

**No manual `subscribe()` at all.** `rxResource` subscribes for us, unsubscribes when the
component is destroyed, cancels the in-flight request if it re-runs, and exposes
`isLoading()`, `error()`, `hasValue()` and `reload()` (#2, #9). The debounced search uses
`toSignal(toObservable(...))`, which is also torn down automatically with the component.

If the codebase can't use resources yet, the same guarantees come from either of these, in order of preference:

1. `toSignal(this.api.getTransactions())` or the `async` pipe, so Angular owns the subscription;
2. `.pipe(takeUntilDestroyed(this.destroyRef))` with explicit `catchError`.

### c. Performance

- **Debounce:** the input updates a cheap `query` signal on every keystroke. Filtering reads a
  version that is `debounceTime(250)`, trimmed and `distinctUntilChanged()` (#11).
- **Stable identity:** rows are tracked by `t.id`, so filtering moves and removes existing DOM nodes
  instead of re-creating them (#10).
- **Virtual scrolling:** `cdk-virtual-scroll-viewport` keeps only the visible rows (about 15) in the
  DOM, whether the list holds 50 or 50,000 (#12).
- **OnPush and signals:** OnPush is the default in Angular 22 (on older versions, set
  `changeDetection: ChangeDetectionStrategy.OnPush`). The app is zoneless, so the component is only
  checked when a signal it reads changes (#13).
- **The production next step (#14):** move search to the API (`GET /transactions?q=&cursor=`) with
  cursor pagination. The debounced term then feeds `rxResource({ params: () => ({ q: this.searchTerm() }), stream: ... })`,
  which cancels stale requests the same way `switchMap` does, so slow responses can't overwrite
  newer ones.

### d. Template

```html
<label class="search">
  <span class="visually-hidden">Search transactions by category</span>
  <input #search type="search" [value]="query()" (input)="query.set(search.value)" />
</label>

@if (transactions.isLoading()) {
  <p role="status">Loading transactions…</p>
} @else if (transactions.error()) {
  <div role="alert">
    We couldn't load your transactions.
    <button type="button" (click)="transactions.reload()">Try again</button>
  </div>
} @else {
  <cdk-virtual-scroll-viewport itemSize="64">
    <ul>
      <li *cdkVirtualFor="let t of filtered(); trackBy: trackById">
        {{ t.category ?? 'Uncategorised' }}
        {{ t.amountMinor / 100 | currency: t.currency : 'symbol-narrow' }}
      </li>
    </ul>
  </cdk-virtual-scroll-viewport>
}
```

- The template uses the built-in control flow (`@if`/`@else`). No `NgFor`/`CommonModule` import is
  needed for those blocks, which removes #4 as a class of bug. For a plain, non-virtual list the
  equivalent is `@for (t of filtered(); track t.id) { … } @empty { … }`, where `track` is required by
  the compiler.
- Amounts go through `CurrencyPipe` with a debit or credit sign (#8). The event handling is typed,
  with a template ref instead of `event: any` (#5). The input has a real label and `type="search"`,
  rows are a semantic `<ul>`, and loading, error and empty states each have the right ARIA role (#15 to #17).

### Tests

[`transaction-list.spec.ts`](../src/app/part-a/transaction-list.spec.ts) and
[`filter-transactions.spec.ts`](../src/app/part-a/filter-transactions.spec.ts) cover:
debounced, case-insensitive filtering; null categories; returning the same reference for an empty
query; the error state with retry; and the empty state.
