/**
 * The contract between the bank-configuration backend and this frontend.
 * Everything that differs between banks lives here as data. No bank-specific code ships in the bundle.
 */
export const TENANT_CONFIG_VERSION = 1;

export const LAYOUT_KEYS = ['sidebar', 'topnav'] as const;
export type LayoutKey = (typeof LAYOUT_KEYS)[number];

export type FeatureKey = 'transactions' | 'transfers' | 'savings' | 'loans' | 'cards';

export interface ThemeTokens {
  primary: string;
  onPrimary: string;
  background: string;
  surface: string;
  text: string;
  radius: string;
  fontFamily: string;
}

export type ValidationRuleName =
  'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'bvn' | 'nigerianPhone' | 'minAge';

export interface ValidationRule {
  rule: ValidationRuleName;
  /** Rule argument: a length, an age or a regex source. */
  value?: number | string;
  /** Bank-specific copy. When it's missing, a sensible default message is used. */
  message?: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select';
  hint?: string;
  options?: { value: string; label: string }[];
  validators?: ValidationRule[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  fields: FieldConfig[];
}

export interface TenantConfig {
  version: number;
  id: string;
  name: string;
  tagline?: string;
  theme: ThemeTokens;
  layout: LayoutKey;
  /** Features are opt-in. A missing or unknown key counts as disabled. */
  features: Partial<Record<FeatureKey, boolean>>;
  /** Widget keys rendered in order. Keys this build doesn't know about are skipped. */
  dashboard: { widgets: string[] };
  onboarding: { steps: OnboardingStep[] };
}
