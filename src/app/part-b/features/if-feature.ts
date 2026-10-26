import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { TenantStore } from '../tenant/tenant-store';
import { FeatureKey } from '../tenant/tenant.model';

/**
 * Renders its content only when the current bank has the feature on.
 * `<button *appIfFeature="'loans'">Apply for a loan</button>`
 *
 * It reads a signal, so it reacts if the tenant config changes at runtime.
 */
@Directive({ selector: '[appIfFeature]' })
export class IfFeature {
  private readonly tenant = inject(TenantStore);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly template = inject(TemplateRef<unknown>);

  readonly appIfFeature = input.required<FeatureKey>();

  constructor() {
    effect(() => {
      const enabled = this.tenant.isEnabled(this.appIfFeature());
      if (enabled && this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.template);
      } else if (!enabled) {
        this.viewContainer.clear();
      }
    });
  }
}
