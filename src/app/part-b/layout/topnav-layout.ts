import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TenantStore } from '../tenant/tenant-store';
import { BankSwitcher } from './bank-switcher';
import { NavLinks } from './nav-links';

@Component({
  selector: 'app-topnav-layout',
  imports: [RouterOutlet, NavLinks, BankSwitcher],
  template: `
    <header class="brand-bar topnav">
      <strong class="brand">{{ tenant.config().name }}</strong>
      <nav aria-label="Main"><app-nav-links /></nav>
      <app-bank-switcher />
    </header>
    <main class="content narrow"><router-outlet /></main>
  `,
  styles: `
    .topnav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem 2rem;
      padding: 0.75rem 1.5rem;
    }
    nav {
      flex: 1;
    }
  `,
})
export class TopnavLayout {
  protected readonly tenant = inject(TenantStore);
}
