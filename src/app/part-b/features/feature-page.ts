import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon, IconName } from '../../shared/icon';
import { TenantStore } from '../tenant/tenant-store';

/** A stand-in for a real feature module (transfers, loans…), kept small for the demo. */
@Component({
  selector: 'app-feature-page',
  host: { class: 'block' },
  imports: [Icon],
  template: `
    <section class="card flex flex-col items-center px-6 py-16 text-center">
      <span class="grid size-16 place-items-center rounded-3xl bg-brand-soft text-brand">
        <app-icon [name]="icon()" [size]="28" />
      </span>
      <h1 class="mt-5 text-2xl font-extrabold sm:text-3xl">{{ heading() }}</h1>
      <p class="mt-2 max-w-md text-muted">
        {{ tenant.config().name }} has <strong class="text-ink">{{ heading() }}</strong> switched
        on, so this route matched and its lazy chunk loaded.
      </p>
      <span
        class="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
      >
        <app-icon name="check" [size]="14" /> Feature enabled in config
      </span>
    </section>
  `,
})
export class FeaturePage {
  protected readonly tenant = inject(TenantStore);
  readonly heading = input('');
  readonly icon = input<IconName>('sparkles');
}

@Component({
  selector: 'app-unavailable',
  host: { class: 'block' },
  imports: [RouterLink, Icon],
  template: `
    <section class="card flex flex-col items-center px-6 py-16 text-center">
      <span class="grid size-16 place-items-center rounded-3xl bg-amber-50 text-amber-600">
        <app-icon name="lock" [size]="28" />
      </span>
      <h1 class="mt-5 text-2xl font-extrabold sm:text-3xl">Not available</h1>
      <p class="mt-2 max-w-md text-muted">
        This service isn't offered by {{ tenant.config().name }}. The route was blocked by a
        <code class="rounded bg-line px-1.5 py-0.5 text-[13px]">canMatch</code> guard, so its code
        was never downloaded.
      </p>
      <a routerLink="/" queryParamsHandling="preserve" class="btn mt-6">
        <app-icon name="home" [size]="16" /> Back to home
      </a>
    </section>
  `,
})
export class Unavailable {
  protected readonly tenant = inject(TenantStore);
}
