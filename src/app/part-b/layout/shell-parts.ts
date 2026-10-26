import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/icon';
import { TenantStore } from '../tenant/tenant-store';

/** The bank's logo mark. Initials on a brand tile stand in for an uploaded logo URL in config. */
@Component({
  selector: 'app-brand-mark',
  template: `
    <span class="flex items-center gap-2.5">
      <span
        class="grid size-9 place-items-center rounded-xl text-sm font-extrabold"
        [class]="inverted() ? 'bg-white text-brand' : 'bg-brand text-brand-fg'"
        aria-hidden="true"
        >{{ initials() }}</span
      >
      <span class="text-[17px] leading-tight font-bold tracking-tight">{{
        tenant.config().name
      }}</span>
    </span>
  `,
})
export class BrandMark {
  protected readonly tenant = inject(TenantStore);
  readonly inverted = input(false);

  protected readonly initials = computed(() =>
    this.tenant
      .config()
      .name.split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase(),
  );
}

/** Greeting row shown at the top of every page. */
@Component({
  selector: 'app-page-greeting',
  host: { class: 'block' },
  imports: [DatePipe, Icon],
  template: `
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm text-muted">{{ today | date: 'EEEE, d MMMM' }}</p>
        <p class="text-lg font-bold tracking-tight sm:text-xl">{{ greeting }}, Daniel 👋</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="relative grid size-10 place-items-center rounded-full border border-line bg-surface text-muted transition hover:text-ink"
          aria-label="Notifications"
        >
          <app-icon name="bell" [size]="18" />
          <span
            class="absolute top-2 right-2.5 size-2 rounded-full bg-brand ring-2 ring-surface"
          ></span>
        </button>
        <span
          class="grid size-10 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand"
          aria-hidden="true"
          >DI</span
        >
      </div>
    </div>
  `,
})
export class PageGreeting {
  protected readonly today = new Date();
  protected readonly greeting = greetingFor(this.today.getHours());
}

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Native-app style tab bar on small screens: the first four enabled destinations plus "More". */
@Component({
  selector: 'app-bottom-tabs',
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    @if (moreOpen()) {
      <button
        type="button"
        class="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
        aria-label="Close menu"
        (click)="moreOpen.set(false)"
      ></button>
      <div
        class="fixed inset-x-3 bottom-24 z-50 rounded-3xl border border-line bg-surface p-2 shadow-2xl lg:hidden"
      >
        @for (item of tenant.navItems(); track item.path) {
          <a
            [routerLink]="item.path"
            queryParamsHandling="preserve"
            (click)="moreOpen.set(false)"
            class="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium hover:bg-brand-soft"
          >
            <app-icon [name]="item.icon" class="text-brand" />
            {{ item.label }}
            <app-icon name="chevronRight" [size]="16" class="ml-auto text-muted" />
          </a>
        }
      </div>
    }

    <nav
      aria-label="Primary"
      class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul class="mx-auto grid max-w-md grid-cols-5">
        @for (item of tabs(); track item.path) {
          <li>
            <a
              [routerLink]="item.path"
              routerLinkActive
              #rla="routerLinkActive"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
              queryParamsHandling="preserve"
              [attr.aria-current]="rla.isActive ? 'page' : null"
              class="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition"
              [class]="rla.isActive ? 'text-brand' : 'text-muted'"
            >
              <span
                class="grid h-7 w-12 place-items-center rounded-full transition"
                [class.bg-brand-soft]="rla.isActive"
              >
                <app-icon [name]="item.icon" [size]="19" />
              </span>
              {{ item.label }}
            </a>
          </li>
        }
        <li>
          <button
            type="button"
            class="flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-muted"
            [attr.aria-expanded]="moreOpen()"
            (click)="moreOpen.update((open) => !open)"
          >
            <span class="grid h-7 w-12 place-items-center rounded-full"
              ><app-icon name="grid" [size]="19"
            /></span>
            More
          </button>
        </li>
      </ul>
    </nav>
  `,
})
export class BottomTabs {
  protected readonly tenant = inject(TenantStore);
  protected readonly tabs = computed(() => this.tenant.navItems().slice(0, 4));
  protected readonly moreOpen = signal(false);
}
