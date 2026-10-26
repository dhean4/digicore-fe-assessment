import { Routes } from '@angular/router';
import { featureGuard } from './part-b/features/feature-guard';

const featurePage = () => import('./part-b/features/feature-page').then((m) => m.FeaturePage);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./part-b/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    // Part A: the fixed transaction list
    path: 'transactions',
    canMatch: [featureGuard('transactions')],
    loadComponent: () => import('./part-a/transaction-list').then((m) => m.TransactionList),
  },
  {
    path: 'transfers',
    canMatch: [featureGuard('transfers')],
    loadComponent: featurePage,
    data: { heading: 'Transfers' },
  },
  {
    path: 'savings',
    canMatch: [featureGuard('savings')],
    loadComponent: featurePage,
    data: { heading: 'Savings' },
  },
  {
    path: 'loans',
    canMatch: [featureGuard('loans')],
    loadComponent: featurePage,
    data: { heading: 'Loans' },
  },
  {
    path: 'cards',
    canMatch: [featureGuard('cards')],
    loadComponent: featurePage,
    data: { heading: 'Cards' },
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./part-b/onboarding/onboarding').then((m) => m.Onboarding),
  },
  {
    path: 'unavailable',
    loadComponent: () => import('./part-b/features/feature-page').then((m) => m.Unavailable),
  },
  { path: '**', redirectTo: '' },
];
