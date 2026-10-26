import { LAYOUT_KEYS, TENANT_CONFIG_VERSION, TenantConfig, ThemeTokens } from './tenant.model';

export const DEFAULT_TENANT_ID = 'default';

/** Production tenants are served from `<tenant>.<APEX_DOMAIN>`, e.g. aurora.bank.example.com. */
export const APEX_DOMAIN = 'bank.example.com';

const TENANT_ID = /^[a-z0-9-]{2,32}$/;

/**
 * Works out which bank this is from the URL. The subdomain is the production mechanism.
 * `?bank=` is a demo and QA override, so reviewers can switch banks on one host.
 * The result is restricted to a safe slug because it ends up in a URL.
 */
export function resolveTenantId({
  hostname,
  search,
}: Pick<Location, 'hostname' | 'search'>): string {
  const fromQuery = new URLSearchParams(search).get('bank');
  const fromHost = hostname.endsWith(`.${APEX_DOMAIN}`)
    ? hostname.slice(0, -(APEX_DOMAIN.length + 1))
    : null;
  const candidate = (fromQuery ?? fromHost ?? '').toLowerCase();
  return TENANT_ID.test(candidate) ? candidate : DEFAULT_TENANT_ID;
}

/**
 * A structural check at the trust boundary. Bad config should fail loudly and fall back,
 * not half-render. In a real system this would be a JSON Schema shared with the config
 * service and enforced in CI, so a broken config can never be published in the first place.
 */
export function parseTenantConfig(raw: unknown): TenantConfig {
  if (!isRecord(raw)) {
    throw new Error('Tenant config must be an object');
  }
  if (raw['version'] !== TENANT_CONFIG_VERSION) {
    throw new Error(`Unsupported tenant config version: ${String(raw['version'])}`);
  }
  for (const key of ['id', 'name', 'theme', 'features', 'dashboard', 'onboarding']) {
    if (!(key in raw)) {
      throw new Error(`Tenant config is missing "${key}"`);
    }
  }
  if (!LAYOUT_KEYS.includes(raw['layout'] as never)) {
    throw new Error(`Unknown layout: ${String(raw['layout'])}`);
  }
  return raw as unknown as TenantConfig;
}

const THEME_VARIABLES: Record<keyof ThemeTokens, string> = {
  primary: '--brand-primary',
  onPrimary: '--brand-on-primary',
  background: '--brand-background',
  surface: '--brand-surface',
  text: '--brand-text',
  radius: '--brand-radius',
  fontFamily: '--brand-font',
};

/** Theming is just CSS custom properties, so switching banks is a repaint, not a rebuild. */
export function applyTheme(root: HTMLElement, theme: ThemeTokens): void {
  for (const [token, variable] of Object.entries(THEME_VARIABLES)) {
    root.style.setProperty(variable, theme[token as keyof ThemeTokens]);
  }
}

/**
 * Used only if both the bank's config and the default config fail to load. The app still
 * boots in a minimal, safe mode with everything optional switched off.
 */
export const SAFE_MODE_TENANT: TenantConfig = {
  version: TENANT_CONFIG_VERSION,
  id: 'safe-mode',
  name: 'Online Banking',
  theme: {
    primary: '#1f2937',
    onPrimary: '#ffffff',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#111827',
    radius: '6px',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  layout: 'topnav',
  features: { transactions: true },
  dashboard: { widgets: ['balance'] },
  onboarding: { steps: [] },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
