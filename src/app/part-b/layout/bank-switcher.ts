import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TenantStore } from '../tenant/tenant-store';

const DEMO_BANKS = [
  { id: 'default', name: 'Digicore Demo Bank' },
  { id: 'aurora', name: 'Aurora Bank' },
  { id: 'meridian', name: 'Meridian Microfinance' },
];

/**
 * Demo only. Real users never switch banks, because the tenant comes from the domain.
 * It's here so reviewers can watch one build re-skin itself at runtime.
 */
@Component({
  selector: 'app-bank-switcher',
  template: `
    <label class="bank-switcher">
      <span>Demo bank</span>
      <select #bank (change)="switchTo(bank.value)">
        @for (b of banks; track b.id) {
          <option [value]="b.id" [selected]="b.id === tenant.config().id">{{ b.name }}</option>
        }
      </select>
    </label>
  `,
})
export class BankSwitcher {
  protected readonly tenant = inject(TenantStore);
  private readonly router = inject(Router);
  protected readonly banks = DEMO_BANKS;

  protected async switchTo(id: string): Promise<void> {
    await this.tenant.load(id);
    await this.router.navigate(['/'], { queryParams: { bank: id } });
  }
}
