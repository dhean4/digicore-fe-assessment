import { Component, computed, inject, linkedSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TenantStore } from '../tenant/tenant-store';
import { FieldConfig, OnboardingStep } from '../tenant/tenant.model';
import { buildValidators, errorMessage } from './validator-registry';

type StepForm = FormGroup<Record<string, FormControl<string>>>;

function buildStepForm(step: OnboardingStep): StepForm {
  const controls: Record<string, FormControl<string>> = {};
  for (const field of step.fields) {
    controls[field.key] = new FormControl('', {
      nonNullable: true,
      validators: buildValidators(field.validators),
    });
  }
  return new FormGroup(controls);
}

/**
 * A config-driven wizard. The steps, fields, their order and their validation all come from
 * the bank's config. The component itself has no knowledge of any particular bank.
 */
@Component({
  selector: 'app-onboarding',
  imports: [ReactiveFormsModule],
  templateUrl: './onboarding.html',
})
export class Onboarding {
  protected readonly tenant = inject(TenantStore);

  protected readonly steps = computed(() => this.tenant.config().onboarding.steps);
  /** Rebuilt whenever the bank, and so the steps, change. */
  protected readonly forms = computed(() => this.steps().map(buildStepForm));

  /** linkedSignal resets the wizard to step 1 automatically when the steps change. */
  protected readonly stepIndex = linkedSignal({ source: this.steps, computation: () => 0 });
  protected readonly submitted = linkedSignal({ source: this.steps, computation: () => false });

  protected readonly step = computed(() => this.steps()[this.stepIndex()]);
  protected readonly form = computed(() => this.forms()[this.stepIndex()]);
  protected readonly isLast = computed(() => this.stepIndex() === this.steps().length - 1);

  protected errorFor(field: FieldConfig): string | null {
    const control = this.form().controls[field.key];
    return control.touched ? errorMessage(field, control.errors) : null;
  }

  protected next(): void {
    const form = this.form();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    if (this.isLast()) {
      // Production: POST every step's values to the onboarding API with the tenant id.
      // The server applies the same rules, because client-side validation is only for UX.
      this.submitted.set(true);
    } else {
      this.stepIndex.update((i) => i + 1);
    }
  }

  protected back(): void {
    this.stepIndex.update((i) => Math.max(0, i - 1));
  }
}
