import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TransactionApi } from '../../part-a/transaction-api';
import { TransactionRow } from '../../part-a/transaction-row';
import { Icon } from '../../shared/icon';
import { IfFeature } from '../features/if-feature';
import { TenantStore } from '../tenant/tenant-store';

@Component({
  selector: 'app-balance-widget',
  imports: [CurrencyPipe, Icon],
  template: `
    <article
      class="relative isolate h-full overflow-hidden rounded-3xl bg-linear-to-br from-brand via-brand to-brand-deep p-6 text-brand-fg shadow-xl shadow-brand/25 sm:p-8"
    >
      <div
        class="pointer-events-none absolute -top-20 -right-16 -z-10 size-72 rounded-full bg-white/15 blur-2xl"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-28 left-1/3 -z-10 size-72 rounded-full bg-black/20 blur-3xl"
      ></div>
      <svg
        class="pointer-events-none absolute top-0 right-0 -z-10 h-full opacity-20"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="160" cy="40" r="90" stroke="currentColor" />
        <circle cx="160" cy="40" r="130" stroke="currentColor" />
        <circle cx="160" cy="40" r="170" stroke="currentColor" />
      </svg>

      <div class="flex items-center justify-between">
        <p class="flex items-center gap-2 text-sm font-medium opacity-85">
          <app-icon name="shield" [size]="16" /> Available balance
        </p>
        <button
          type="button"
          class="grid size-9 place-items-center rounded-full bg-white/15 transition hover:bg-white/25"
          [attr.aria-label]="hidden() ? 'Show balance' : 'Hide balance'"
          [attr.aria-pressed]="hidden()"
          (click)="hidden.update((h) => !h)"
        >
          <app-icon [name]="hidden() ? 'eye' : 'eyeOff'" [size]="17" />
        </button>
      </div>

      <p class="mt-3 text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
        @if (hidden()) {
          ₦ ••••••
        } @else {
          {{ 1_284_350.75 | currency: 'NGN' : 'symbol-narrow' }}
        }
      </p>

      <div class="mt-8 flex flex-wrap items-center gap-3">
        <div
          class="flex items-center gap-2 rounded-full bg-white/15 py-1.5 pr-1.5 pl-4 text-sm backdrop-blur"
        >
          <span class="hidden opacity-80 sm:inline">{{ tenant.config().name }} ·</span
          ><span class="opacity-80 sm:hidden">Acct</span>
          <span class="font-semibold tracking-wider whitespace-nowrap tabular-nums"
            >0123 456 789</span
          >
          <button
            type="button"
            class="grid size-7 place-items-center rounded-full bg-white/20 transition hover:bg-white/30"
            aria-label="Copy account number"
            (click)="copy()"
          >
            <app-icon [name]="copied() ? 'check' : 'copy'" [size]="14" />
          </button>
        </div>
        <span class="sr-only" aria-live="polite">{{
          copied() ? 'Account number copied' : ''
        }}</span>
      </div>
    </article>
  `,
})
export class BalanceWidget {
  protected readonly tenant = inject(TenantStore);
  protected readonly hidden = signal(false);
  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    await navigator.clipboard?.writeText('0123456789').catch(() => undefined);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1800);
  }
}

@Component({
  selector: 'app-quick-actions-widget',
  imports: [RouterLink, IfFeature, Icon],
  template: `
    <article class="card h-full">
      <h2 class="text-base font-bold">Quick actions</h2>
      <div class="mt-4 grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-2">
        <a
          *appIfFeature="'transfers'"
          routerLink="/transfers"
          queryParamsHandling="preserve"
          class="group flex flex-col items-center gap-2 text-center"
        >
          <span
            class="grid size-14 place-items-center rounded-2xl bg-brand text-brand-fg shadow-lg shadow-brand/30 transition group-hover:-translate-y-0.5"
            ><app-icon name="send" [size]="22"
          /></span>
          <span class="text-xs font-semibold">Send</span>
        </a>
        <button type="button" class="group flex flex-col items-center gap-2 text-center">
          <span
            class="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand transition group-hover:-translate-y-0.5"
            ><app-icon name="phone" [size]="22"
          /></span>
          <span class="text-xs font-semibold">Airtime</span>
        </button>
        <button type="button" class="group flex flex-col items-center gap-2 text-center">
          <span
            class="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand transition group-hover:-translate-y-0.5"
            ><app-icon name="receipt" [size]="22"
          /></span>
          <span class="text-xs font-semibold">Pay bills</span>
        </button>
        <a
          *appIfFeature="'cards'"
          routerLink="/cards"
          queryParamsHandling="preserve"
          class="group flex flex-col items-center gap-2 text-center"
        >
          <span
            class="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand transition group-hover:-translate-y-0.5"
            ><app-icon name="card" [size]="22"
          /></span>
          <span class="text-xs font-semibold">Cards</span>
        </a>
      </div>
    </article>
  `,
})
export class QuickActionsWidget {}

@Component({
  selector: 'app-recent-transactions-widget',
  imports: [RouterLink, TransactionRow],
  template: `
    <article class="card h-full p-0! sm:p-0!">
      <div class="flex items-center justify-between px-5 pt-5 pb-2 sm:px-6 sm:pt-6">
        <h2 class="text-base font-bold">Recent transactions</h2>
        <a
          routerLink="/transactions"
          queryParamsHandling="preserve"
          class="text-sm font-semibold text-brand hover:underline"
          >View all</a
        >
      </div>
      <ul class="divide-y divide-line pb-2">
        @for (t of recent(); track t.id) {
          <li><app-transaction-row [transaction]="t" /></li>
        } @empty {
          @for (i of [1, 2, 3, 4]; track i) {
            <li class="flex h-[72px] animate-pulse items-center gap-4 px-5">
              <span class="size-11 rounded-2xl bg-line"></span
              ><span class="h-3 flex-1 rounded bg-line"></span>
            </li>
          }
        }
      </ul>
    </article>
  `,
})
export class RecentTransactionsWidget {
  private readonly api = inject(TransactionApi);
  private readonly transactions = rxResource({ stream: () => this.api.getTransactions() });
  protected readonly recent = computed(() =>
    this.transactions.hasValue() ? this.transactions.value().slice(0, 5) : [],
  );
}

@Component({
  selector: 'app-insights-widget',
  imports: [CurrencyPipe, DecimalPipe, Icon],
  template: `
    <article class="card h-full">
      <h2 class="text-base font-bold">Last 30 days</h2>
      <div class="mt-4 grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-emerald-50 p-4">
          <p class="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <app-icon name="arrowIn" [size]="14" /> Money in
          </p>
          <p class="mt-1.5 text-lg font-bold tabular-nums sm:text-xl">
            {{ stats().moneyIn | currency: 'NGN' : 'symbol-narrow' : '1.0-0' }}
          </p>
        </div>
        <div class="rounded-2xl bg-rose-50 p-4">
          <p class="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <app-icon name="arrowOut" [size]="14" /> Money out
          </p>
          <p class="mt-1.5 text-lg font-bold tabular-nums sm:text-xl">
            {{ stats().moneyOut | currency: 'NGN' : 'symbol-narrow' : '1.0-0' }}
          </p>
        </div>
      </div>

      <p class="eyebrow mt-6">Where your money went</p>
      <div class="mt-3 flex h-3 overflow-hidden rounded-full bg-line">
        @for (c of stats().top; track c.name; let i = $index) {
          <span class="h-full" [style.width.%]="c.share" [style.background]="shades[i]"></span>
        }
      </div>
      <ul class="mt-4 space-y-2.5 text-sm">
        @for (c of stats().top; track c.name; let i = $index) {
          <li class="flex items-center gap-2.5">
            <span class="size-2.5 rounded-full" [style.background]="shades[i]"></span>
            <span class="flex-1">{{ c.name }}</span>
            <span class="font-semibold tabular-nums">{{ c.share | number: '1.0-0' }}%</span>
          </li>
        }
      </ul>
    </article>
  `,
})
export class InsightsWidget {
  private readonly api = inject(TransactionApi);
  private readonly transactions = rxResource({ stream: () => this.api.getTransactions() });

  /** Brand tints for the spending bar, derived at runtime from the bank's primary colour. */
  protected readonly shades = [100, 75, 50, 30].map(
    (pct) => `color-mix(in oklab, var(--brand-primary) ${pct}%, white)`,
  );

  protected readonly stats = computed(() => {
    const all = this.transactions.hasValue() ? this.transactions.value() : [];
    const since = all.length ? Date.parse(all[0].postedAt) - 30 * 86_400_000 : 0;
    const recent = all.filter((t) => Date.parse(t.postedAt) >= since);

    let moneyIn = 0;
    let moneyOut = 0;
    const byCategory = new Map<string, number>();
    for (const t of recent) {
      const amount = t.amountMinor / 100;
      if (t.direction === 'credit') {
        moneyIn += amount;
      } else {
        moneyOut += amount;
        const name = t.category ?? 'Other';
        byCategory.set(name, (byCategory.get(name) ?? 0) + amount);
      }
    }
    const top = [...byCategory]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, value]) => ({ name, share: moneyOut ? (value / moneyOut) * 100 : 0 }));
    return { moneyIn, moneyOut, top };
  });
}

@Component({
  selector: 'app-savings-goal-widget',
  imports: [CurrencyPipe, Icon],
  template: `
    <article class="card flex h-full flex-col">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold">Savings goal</h2>
        <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
          >+12% p.a.</span
        >
      </div>
      <div class="flex flex-1 items-center gap-6 py-5">
        <div class="relative size-28 shrink-0">
          <svg viewBox="0 0 120 120" class="size-full -rotate-90" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke-width="12"
              class="stroke-brand-soft"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke-width="12"
              stroke-linecap="round"
              class="stroke-brand"
              [attr.stroke-dasharray]="circumference"
              [attr.stroke-dashoffset]="circumference * (1 - progress / 100)"
            />
          </svg>
          <span class="absolute inset-0 grid place-items-center text-xl font-extrabold"
            >{{ progress }}%</span
          >
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold">Rent 2027</p>
          <p class="mt-1 text-sm text-muted">
            {{ 1_550_000 | currency: 'NGN' : 'symbol-narrow' : '1.0-0' }} of
            {{ 2_500_000 | currency: 'NGN' : 'symbol-narrow' : '1.0-0' }}
          </p>
          <p class="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <app-icon name="zap" [size]="15" class="text-brand" /> Auto-saves ₦25,000 every Friday
          </p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <button type="button" class="btn">Top up</button>
        <button type="button" class="btn-ghost">Manage</button>
      </div>
    </article>
  `,
})
export class SavingsGoalWidget {
  protected readonly progress = 62;
  protected readonly circumference = 2 * Math.PI * 50;
}

@Component({
  selector: 'app-loan-offer-widget',
  imports: [RouterLink, Icon],
  template: `
    <article
      class="relative isolate flex h-full flex-col overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-7"
    >
      <div
        class="pointer-events-none absolute -right-10 -bottom-16 -z-10 size-56 rounded-full bg-brand opacity-60 blur-3xl"
      ></div>
      <span
        class="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"
        ><app-icon name="zap" [size]="13" /> Pre-approved</span
      >
      <h2 class="mt-4 text-2xl font-extrabold">Up to ₦5,000,000 for your business</h2>
      <p class="mt-2 text-sm text-white/70">
        No collateral. Decision in minutes, repaid from your daily sales.
      </p>
      <a
        routerLink="/loans"
        queryParamsHandling="preserve"
        class="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-white/90"
      >
        See my offer <app-icon name="chevronRight" [size]="16" />
      </a>
    </article>
  `,
})
export class LoanOfferWidget {}
