import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../shared/icon';
import { TenantStore } from '../tenant/tenant-store';

const DEMO_BANKS = [
  { id: 'default', name: 'Digicore Demo Bank', swatch: '#1d4ed8' },
  { id: 'aurora', name: 'Aurora Bank', swatch: '#6d28d9' },
  { id: 'meridian', name: 'Meridian Microfinance', swatch: '#0f766e' },
];

/**
 * Demo only. Real users never switch banks, because the tenant comes from the domain.
 * It's here so reviewers can watch one build re-skin itself at runtime.
 */
@Component({
  selector: 'app-bank-switcher',
  imports: [Icon],
  host: { '(document:keydown.escape)': 'open.set(false)' },
  template: `
    <div class="fixed right-4 bottom-24 z-50 lg:right-6 lg:bottom-6">
      @if (open()) {
        <button
          type="button"
          class="fixed inset-0 cursor-default"
          aria-label="Close bank switcher"
          (click)="open.set(false)"
        ></button>
        <div
          id="bank-menu"
          role="menu"
          class="absolute right-0 bottom-full mb-3 w-72 origin-bottom-right rounded-3xl border border-line bg-surface p-2 text-ink shadow-2xl"
        >
          <p class="eyebrow px-3 pt-2 pb-1">One build · three banks</p>
          @for (bank of banks; track bank.id) {
            <button
              type="button"
              role="menuitemradio"
              [attr.aria-checked]="bank.id === tenant.config().id"
              class="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-black/5"
              (click)="switchTo(bank.id)"
            >
              <span
                class="size-5 rounded-full ring-4 ring-black/5"
                [style.background]="bank.swatch"
              ></span>
              {{ bank.name }}
              @if (bank.id === tenant.config().id) {
                <app-icon name="check" [size]="16" class="ml-auto text-brand" />
              }
            </button>
          }
          <p class="px-3 pt-1 pb-2 text-xs text-muted">
            Loads <code>config/&lt;bank&gt;.json</code> at runtime. No rebuild.
          </p>
        </div>
      }
      <button
        type="button"
        class="relative flex items-center gap-2 rounded-full bg-ink p-2 text-sm sm:pr-4 font-semibold text-white shadow-xl ring-1 ring-white/10 transition hover:scale-[1.02]"
        aria-haspopup="menu"
        aria-controls="bank-menu"
        [attr.aria-expanded]="open()"
        (click)="open.update((value) => !value)"
      >
        <span class="grid size-7 place-items-center rounded-full bg-brand"
          ><app-icon name="sparkles" [size]="15"
        /></span>
        <span class="sr-only sm:not-sr-only">Demo · switch bank</span>
        <span class="hidden opacity-70 sm:inline-flex"
          ><app-icon name="chevronDown" [size]="16"
        /></span>
      </button>
    </div>
  `,
})
export class BankSwitcher {
  protected readonly tenant = inject(TenantStore);
  private readonly router = inject(Router);
  protected readonly banks = DEMO_BANKS;
  protected readonly open = signal(false);

  protected async switchTo(id: string): Promise<void> {
    this.open.set(false);
    await this.tenant.load(id);
    await this.router.navigate(['/'], { queryParams: { bank: id } });
  }
}
