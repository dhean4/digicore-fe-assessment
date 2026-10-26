import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Icon, IconName } from '../shared/icon';
import { Transaction } from './transaction.model';

interface CategoryStyle {
  icon: IconName;
  /** Literal class strings so Tailwind can see them at build time. */
  tone: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Airtime: { icon: 'phone', tone: 'bg-sky-100 text-sky-700' },
  Transfer: { icon: 'send', tone: 'bg-indigo-100 text-indigo-700' },
  'POS Purchase': { icon: 'cart', tone: 'bg-amber-100 text-amber-700' },
  Bills: { icon: 'lightbulb', tone: 'bg-orange-100 text-orange-700' },
  Salary: { icon: 'briefcase', tone: 'bg-emerald-100 text-emerald-700' },
  'ATM Withdrawal': { icon: 'banknote', tone: 'bg-slate-200 text-slate-700' },
  'Card Payment': { icon: 'card', tone: 'bg-fuchsia-100 text-fuchsia-700' },
  Interest: { icon: 'percent', tone: 'bg-teal-100 text-teal-700' },
};
const UNCATEGORISED: CategoryStyle = { icon: 'help', tone: 'bg-zinc-100 text-zinc-500' };

@Component({
  selector: 'app-transaction-row',
  imports: [CurrencyPipe, DatePipe, Icon],
  host: { class: 'flex h-[72px] items-center gap-3 px-4 sm:gap-4 sm:px-5' },
  template: `
    <span class="grid size-11 shrink-0 place-items-center rounded-2xl" [class]="style().tone">
      <app-icon [name]="style().icon" [size]="19" />
    </span>
    <div class="min-w-0 flex-1">
      <p class="truncate text-[15px] font-semibold">
        {{ transaction().category ?? 'Uncategorised' }}
      </p>
      <p class="truncate text-sm text-muted">{{ transaction().narration }}</p>
    </div>
    <div class="text-right">
      <p class="text-[15px] font-semibold tabular-nums" [class.text-emerald-600]="isCredit()">
        {{ isCredit() ? '+' : '−'
        }}{{ transaction().amountMinor / 100 | currency: transaction().currency : 'symbol-narrow' }}
      </p>
      <time class="text-xs text-muted" [attr.datetime]="transaction().postedAt">{{
        transaction().postedAt | date: 'd MMM, h:mm a'
      }}</time>
    </div>
  `,
})
export class TransactionRow {
  readonly transaction = input.required<Transaction>();

  protected readonly isCredit = computed(() => this.transaction().direction === 'credit');
  protected readonly style = computed(
    () => CATEGORY_STYLES[this.transaction().category ?? ''] ?? UNCATEGORISED,
  );
}
