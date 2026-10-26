import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BankSwitcher } from './bank-switcher';
import { NavLinks } from './nav-links';
import { BottomTabs, BrandMark, PageGreeting } from './shell-parts';

@Component({
  selector: 'app-topnav-layout',
  imports: [RouterOutlet, NavLinks, BankSwitcher, BrandMark, PageGreeting, BottomTabs],
  template: `
    <header class="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <app-brand-mark />
        <nav aria-label="Main" class="ml-auto hidden lg:block"><app-nav-links variant="top" /></nav>
      </div>
    </header>
    <main class="mx-auto max-w-6xl space-y-6 px-4 pt-6 pb-32 sm:px-6 lg:pt-8 lg:pb-16">
      <app-page-greeting />
      <router-outlet />
    </main>
    <app-bottom-tabs />
    <app-bank-switcher />
  `,
})
export class TopnavLayout {}
