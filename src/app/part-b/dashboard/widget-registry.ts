import { Type } from '@angular/core';
import { FeatureKey } from '../tenant/tenant.model';

/** Width on the 12-column desktop grid. Phones always stack widgets. */
export type WidgetSize = 4 | 6 | 8;

export interface WidgetDefinition {
  load: () => Promise<Type<unknown>>;
  /** Hidden when the bank has this feature off, even if its config lists the widget. */
  requires?: FeatureKey;
  size: WidgetSize;
}

export const WIDGETS: Partial<Record<string, WidgetDefinition>> = {
  balance: { load: () => import('./widgets').then((m) => m.BalanceWidget), size: 8 },
  quickActions: { load: () => import('./widgets').then((m) => m.QuickActionsWidget), size: 4 },
  recentTransactions: {
    load: () => import('./widgets').then((m) => m.RecentTransactionsWidget),
    requires: 'transactions',
    size: 6,
  },
  insights: {
    load: () => import('./widgets').then((m) => m.InsightsWidget),
    requires: 'transactions',
    size: 6,
  },
  savingsGoal: {
    load: () => import('./widgets').then((m) => m.SavingsGoalWidget),
    requires: 'savings',
    size: 6,
  },
  loanOffer: {
    load: () => import('./widgets').then((m) => m.LoanOfferWidget),
    requires: 'loans',
    size: 6,
  },
};

/** Literal classes so Tailwind can see them at build time. */
const SPAN_CLASSES: Record<number, string> = {
  4: 'lg:col-span-4',
  6: 'lg:col-span-6',
  8: 'lg:col-span-8',
  12: 'lg:col-span-12',
};

/**
 * Packs widgets into rows in config order. If a row would be left part-empty, its last widget
 * stretches to fill it, so any order a bank picks still produces a tidy grid.
 */
export function layoutWidgets(sizes: readonly WidgetSize[]): string[] {
  const spans: number[] = [];
  let used = 0;
  sizes.forEach((size, i) => {
    if (used + size > 12) {
      spans[spans.length - 1] += 12 - used;
      used = 0;
    }
    spans.push(size);
    used = (used + size) % 12;
    if (i === sizes.length - 1 && used > 0) {
      spans[spans.length - 1] += 12 - used;
    }
  });
  return spans.map((span) => SPAN_CLASSES[span]);
}
