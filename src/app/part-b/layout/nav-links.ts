import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/icon';
import { TenantStore } from '../tenant/tenant-store';

/** Only lists features the current bank has enabled. */
@Component({
  selector: 'app-nav-links',
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    <ul
      class="nav-links"
      [class]="variant() === 'sidebar' ? 'space-y-1' : 'flex items-center gap-1'"
    >
      @for (item of tenant.navItems(); track item.path) {
        <li>
          <a
            [routerLink]="item.path"
            routerLinkActive
            #rla="routerLinkActive"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            [attr.aria-current]="rla.isActive ? 'page' : null"
            queryParamsHandling="preserve"
            [class]="variant() === 'sidebar' ? sidebarClass(rla.isActive) : topClass(rla.isActive)"
          >
            <app-icon [name]="item.icon" [size]="variant() === 'sidebar' ? 19 : 17" />
            {{ item.label }}
          </a>
        </li>
      }
    </ul>
  `,
})
export class NavLinks {
  protected readonly tenant = inject(TenantStore);
  readonly variant = input<'sidebar' | 'top'>('top');

  protected sidebarClass(active: boolean): string {
    return `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-medium transition ${
      active
        ? 'bg-white/15 text-white shadow-inner'
        : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`;
  }

  protected topClass(active: boolean): string {
    return `flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition ${
      active ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'
    }`;
  }
}
