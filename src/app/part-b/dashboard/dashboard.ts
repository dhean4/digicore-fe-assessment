import { NgComponentOutlet } from '@angular/common';
import { Component, computed, inject, resource } from '@angular/core';
import { TenantStore } from '../tenant/tenant-store';
import { WIDGETS, WidgetDefinition } from './widget-registry';

/** The home screen is assembled from the bank's config: which widgets appear, and in what order. */
@Component({
  selector: 'app-dashboard',
  imports: [NgComponentOutlet],
  template: `
    <h1>Welcome to {{ tenant.config().name }}</h1>
    @if (tenant.config().tagline; as tagline) {
      <p class="tagline">{{ tagline }}</p>
    }
    <div class="widget-grid">
      @for (widget of widgets.value(); track $index) {
        <ng-container *ngComponentOutlet="widget" />
      }
    </div>
  `,
})
export class Dashboard {
  protected readonly tenant = inject(TenantStore);

  private readonly definitions = computed(() =>
    this.tenant
      .config()
      .dashboard.widgets.map((key) => WIDGETS[key])
      // Unknown keys are skipped, so config can run ahead of a deployment without breaking it.
      .filter((def): def is WidgetDefinition => !!def)
      .filter((def) => !def.requires || this.tenant.isEnabled(def.requires)),
  );

  protected readonly widgets = resource({
    params: () => this.definitions(),
    loader: ({ params }) => Promise.all(params.map((def) => def.load())),
    defaultValue: [],
  });
}
