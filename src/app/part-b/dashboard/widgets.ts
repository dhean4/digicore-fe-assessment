import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IfFeature } from '../features/if-feature';

@Component({
  selector: 'app-balance-widget',
  imports: [CurrencyPipe],
  template: `
    <article class="card">
      <h2>Available balance</h2>
      <p class="figure">{{ 1_284_350.75 | currency: 'NGN' : 'symbol-narrow' }}</p>
    </article>
  `,
})
export class BalanceWidget {}

@Component({
  selector: 'app-quick-actions-widget',
  imports: [RouterLink, IfFeature],
  template: `
    <article class="card">
      <h2>Quick actions</h2>
      <div class="actions">
        <a
          *appIfFeature="'transfers'"
          class="button"
          routerLink="/transfers"
          queryParamsHandling="preserve"
          >Send money</a
        >
        <a
          *appIfFeature="'transactions'"
          class="button secondary"
          routerLink="/transactions"
          queryParamsHandling="preserve"
          >Transactions</a
        >
        <a
          *appIfFeature="'cards'"
          class="button secondary"
          routerLink="/cards"
          queryParamsHandling="preserve"
          >Cards</a
        >
      </div>
    </article>
  `,
})
export class QuickActionsWidget {}

@Component({
  selector: 'app-savings-goal-widget',
  template: `
    <article class="card">
      <h2>Savings goal</h2>
      <progress max="100" value="62" aria-label="Savings goal progress">62%</progress>
      <p>62% of your rent goal</p>
    </article>
  `,
})
export class SavingsGoalWidget {}

@Component({
  selector: 'app-loan-offer-widget',
  imports: [RouterLink],
  template: `
    <article class="card accent">
      <h2>You're pre-approved</h2>
      <p>Up to ₦500,000 for your business, decided in minutes.</p>
      <a class="button" routerLink="/loans" queryParamsHandling="preserve">See offer</a>
    </article>
  `,
})
export class LoanOfferWidget {}
