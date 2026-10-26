import { NgComponentOutlet } from '@angular/common';
import { Component, computed, inject, resource } from '@angular/core';
import { TenantStore } from '../tenant/tenant-store';
import { WIDGETS, WidgetDefinition, layoutWidgets } from './widget-registry';

/** The home screen is assembled from the bank's config: which widgets appear, and in what order. */
@Component({
  selector: 'app-dashboard',
  imports: [NgComponentOutlet],
  host: { class: 'block' },
  template: `
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-12">
      @for (widget of widgets.value(); track $index) {
        <div class="min-w-0 *:block *:h-full" [class]="widget.span">
          <ng-container *ngComponentOutlet="widget.component" />
        </div>
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
    loader: async ({ params }) => {
      const components = await Promise.all(params.map((def) => def.load()));
      const spans = layoutWidgets(params.map((def) => def.size));
      return components.map((component, i) => ({ component, span: spans[i] }));
    },
    defaultValue: [],
  });
}
