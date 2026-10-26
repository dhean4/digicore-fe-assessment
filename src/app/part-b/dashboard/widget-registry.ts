import { Type } from '@angular/core';
import { FeatureKey } from '../tenant/tenant.model';

export interface WidgetDefinition {
  load: () => Promise<Type<unknown>>;
  /** Hidden when the bank has this feature off, even if its config lists the widget. */
  requires?: FeatureKey;
}

export const WIDGETS: Partial<Record<string, WidgetDefinition>> = {
  balance: { load: () => import('./widgets').then((m) => m.BalanceWidget) },
  quickActions: { load: () => import('./widgets').then((m) => m.QuickActionsWidget) },
  savingsGoal: {
    load: () => import('./widgets').then((m) => m.SavingsGoalWidget),
    requires: 'savings',
  },
  loanOffer: {
    load: () => import('./widgets').then((m) => m.LoanOfferWidget),
    requires: 'loans',
  },
};
