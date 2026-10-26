import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TenantStore } from '../tenant/tenant-store';

/** Only lists features the current bank has enabled. */
@Component({
  selector: 'app-nav-links',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <ul class="nav-links">
      @for (item of tenant.navItems(); track item.path) {
        <li>
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            queryParamsHandling="preserve"
            >{{ item.label }}</a
          >
        </li>
      }
    </ul>
  `,
})
export class NavLinks {
  protected readonly tenant = inject(TenantStore);
}
