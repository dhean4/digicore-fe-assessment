import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TenantStore } from '../tenant/tenant-store';
import { BankSwitcher } from './bank-switcher';
import { NavLinks } from './nav-links';

@Component({
  selector: 'app-sidebar-layout',
  imports: [RouterOutlet, NavLinks, BankSwitcher],
  template: `
    <div class="sidebar-layout">
      <aside class="brand-bar">
        <strong class="brand">{{ tenant.config().name }}</strong>
        <nav aria-label="Main"><app-nav-links /></nav>
        <app-bank-switcher />
      </aside>
      <main class="content"><router-outlet /></main>
    </div>
  `,
  styles: `
    .sidebar-layout {
      display: grid;
      grid-template-columns: 15rem 1fr;
      min-height: 100vh;
    }
    .brand-bar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem 1rem;
    }
    app-bank-switcher {
      margin-top: auto;
    }
    @media (max-width: 720px) {
      .sidebar-layout {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class SidebarLayout {
  protected readonly tenant = inject(TenantStore);
}
