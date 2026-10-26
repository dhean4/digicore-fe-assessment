import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Icon } from '../../shared/icon';
import { BankSwitcher } from './bank-switcher';
import { NavLinks } from './nav-links';
import { BottomTabs, BrandMark, PageGreeting } from './shell-parts';

@Component({
  selector: 'app-sidebar-layout',
  imports: [RouterOutlet, NavLinks, BankSwitcher, BrandMark, PageGreeting, BottomTabs, Icon],
  template: `
    <div class="min-h-dvh lg:grid lg:grid-cols-[280px_1fr]">
      <aside
        class="relative hidden overflow-hidden bg-linear-to-b from-brand to-brand-deep text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:gap-8 lg:p-6"
      >
        <div
          class="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-white/10 blur-3xl"
        ></div>
        <app-brand-mark [inverted]="true" />
        <nav aria-label="Main"><app-nav-links variant="sidebar" /></nav>

        <div class="mt-auto rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
          <div class="flex items-center gap-3">
            <span
              class="grid size-10 place-items-center rounded-full bg-white text-sm font-bold text-brand"
              >DI</span
            >
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">Daniel Ibisagba</p>
              <p class="text-xs text-white/70">Tier 3 · Verified</p>
            </div>
            <app-icon name="shield" [size]="18" class="ml-auto text-white/80" />
          </div>
        </div>
      </aside>

      <div class="min-w-0">
        <header
          class="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/85 px-4 py-3 backdrop-blur-xl lg:hidden"
        >
          <app-brand-mark />
        </header>
        <main class="mx-auto max-w-6xl space-y-6 px-4 pt-6 pb-32 sm:px-6 lg:px-10 lg:pt-8 lg:pb-16">
          <app-page-greeting />
          <router-outlet />
        </main>
      </div>
    </div>
    <app-bottom-tabs />
    <app-bank-switcher />
  `,
})
export class SidebarLayout {}
