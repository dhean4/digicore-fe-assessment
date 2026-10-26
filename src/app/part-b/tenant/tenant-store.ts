import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import {
  DEFAULT_TENANT_ID,
  SAFE_MODE_TENANT,
  applyTheme,
  parseTenantConfig,
  resolveTenantId,
} from './tenant-config';
import { IconName } from '../../shared/icon';
import { FeatureKey, TenantConfig } from './tenant.model';

export interface NavItem {
  path: string;
  label: string;
  icon: IconName;
  feature?: FeatureKey;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/transactions', label: 'Transactions', icon: 'list', feature: 'transactions' },
  { path: '/transfers', label: 'Transfers', icon: 'send', feature: 'transfers' },
  { path: '/savings', label: 'Savings', icon: 'piggy', feature: 'savings' },
  { path: '/loans', label: 'Loans', icon: 'loan', feature: 'loans' },
  { path: '/cards', label: 'Cards', icon: 'card', feature: 'cards' },
  { path: '/onboarding', label: 'Open an account', icon: 'userPlus' },
];

/** The runtime source of truth for "which bank am I, and what does it look like?". */
@Injectable({ providedIn: 'root' })
export class TenantStore {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);

  private readonly state = signal<TenantConfig>(SAFE_MODE_TENANT);

  readonly config = this.state.asReadonly();
  readonly layout = computed(() => this.state().layout);
  readonly navItems = computed(() =>
    NAV_ITEMS.filter((item) => !item.feature || this.isEnabled(item.feature)),
  );

  isEnabled(feature: FeatureKey): boolean {
    return this.state().features[feature] === true;
  }

  /**
   * Runs once before bootstrap (see app.config.ts) and again when the demo switcher changes bank.
   * Fallback order: the bank's own config, then the default config, then the built-in safe mode.
   */
  async load(tenantId = resolveTenantId(this.document.location)): Promise<void> {
    const config =
      (await this.fetch(tenantId)) ??
      (tenantId !== DEFAULT_TENANT_ID ? await this.fetch(DEFAULT_TENANT_ID) : null) ??
      SAFE_MODE_TENANT;

    this.state.set(config);
    applyTheme(this.document.documentElement, config.theme);
    this.title.setTitle(config.name);
  }

  private async fetch(tenantId: string): Promise<TenantConfig | null> {
    try {
      // Relative URL, so it respects <base href>. In production this would be a CDN or
      // config-service URL with a short cache TTL, so edits go live without a deploy.
      const raw = await firstValueFrom(this.http.get<unknown>(`config/${tenantId}.json`));
      return parseTenantConfig(raw);
    } catch (error) {
      console.warn(`[tenant] Could not load config for "${tenantId}"`, error);
      return null;
    }
  }
}
