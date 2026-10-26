import { Component, inject, input } from '@angular/core';
import { TenantStore } from '../tenant/tenant-store';

/** A stand-in for a real feature module (transfers, loans…), kept small for the demo. */
@Component({
  selector: 'app-feature-page',
  template: `
    <h1>{{ heading() }}</h1>
    <p>
      {{ tenant.config().name }} has this feature enabled, so its route matched and its lazy chunk
      loaded.
    </p>
  `,
})
export class FeaturePage {
  protected readonly tenant = inject(TenantStore);
  readonly heading = input('');
}

@Component({
  selector: 'app-unavailable',
  template: `
    <h1>Not available</h1>
    <p>This service isn't offered by {{ tenant.config().name }}.</p>
  `,
})
export class Unavailable {
  protected readonly tenant = inject(TenantStore);
}
