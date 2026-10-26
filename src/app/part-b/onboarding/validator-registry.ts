import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FieldConfig, ValidationRule, ValidationRuleName } from '../tenant/tenant.model';

type ValidatorFactory = (value: ValidationRule['value']) => ValidatorFn;

/** An empty value counts as valid, so each rule composes with `required` instead of duplicating it. */
const whenPresent =
  (errorKey: string, test: (value: string) => boolean): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null =>
    !control.value || test(String(control.value)) ? null : { [errorKey]: true };

/**
 * Banks pick rules by name in config and never ship code. A new rule type is a code change,
 * reviewed and tested once and then available to every bank. That's deliberate: arbitrary
 * regex or JS from config would be a security and stability risk.
 */
export const VALIDATOR_REGISTRY: Record<ValidationRuleName, ValidatorFactory> = {
  required: () => Validators.required,
  email: () => Validators.email,
  minLength: (value) => Validators.minLength(Number(value)),
  maxLength: (value) => Validators.maxLength(Number(value)),
  pattern: (value) => Validators.pattern(String(value)),
  bvn: () => whenPresent('bvn', (v) => /^\d{11}$/.test(v)),
  nigerianPhone: () => whenPresent('nigerianPhone', (v) => /^(?:\+234|0)[789][01]\d{8}$/.test(v)),
  minAge: (value) => whenPresent('minAge', (v) => ageOn(new Date(), v) >= Number(value)),
};

/** Angular's built-in validators report their errors in lowercase. */
const ERROR_KEYS: Partial<Record<ValidationRuleName, string>> = {
  minLength: 'minlength',
  maxLength: 'maxlength',
};

const DEFAULT_MESSAGES: Record<
  ValidationRuleName,
  (label: string, value: ValidationRule['value']) => string
> = {
  required: (label) => `${label} is required.`,
  email: () => 'Enter a valid email address.',
  minLength: (label, value) => `${label} must be at least ${value} characters.`,
  maxLength: (label, value) => `${label} must be at most ${value} characters.`,
  pattern: (label) => `${label} is not in the expected format.`,
  bvn: () => 'BVN must be exactly 11 digits.',
  nigerianPhone: () => 'Enter a valid Nigerian phone number.',
  minAge: (_, value) => `You must be at least ${value} years old.`,
};

export function buildValidators(rules: ValidationRule[] = []): ValidatorFn[] {
  return rules.flatMap((rule) => {
    const factory = VALIDATOR_REGISTRY[rule.rule];
    if (!factory) {
      // The config is newer than this build. Skip the rule rather than crash the form,
      // because the API re-validates anyway.
      console.warn(`[onboarding] Unknown validation rule "${rule.rule}" ignored`);
      return [];
    }
    return [factory(rule.value)];
  });
}

/** The message for the first failing rule, in the order the bank listed them. */
export function errorMessage(field: FieldConfig, errors: ValidationErrors | null): string | null {
  if (!errors) {
    return null;
  }
  const failed = field.validators?.find((rule) => errors[ERROR_KEYS[rule.rule] ?? rule.rule]);
  return failed
    ? (failed.message ?? DEFAULT_MESSAGES[failed.rule](field.label, failed.value))
    : null;
}

function ageOn(today: Date, isoDate: string): number {
  const dob = new Date(isoDate);
  if (Number.isNaN(dob.getTime())) {
    return -1;
  }
  const hadBirthday =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  return today.getFullYear() - dob.getFullYear() - (hadBirthday ? 0 : 1);
}
