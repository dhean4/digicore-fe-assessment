import { NgComponentOutlet } from '@angular/common';
import { Component, inject, resource } from '@angular/core';
import { LAYOUTS } from './part-b/layout/layout-registry';
import { TenantStore } from './part-b/tenant/tenant-store';

/** The root only chooses which layout shell to render. The bank's config decides which one. */
@Component({
  selector: 'app-root',
  imports: [NgComponentOutlet],
  template: `
    @if (layout.hasValue()) {
      <ng-container *ngComponentOutlet="layout.value()" />
    }
  `,
})
export class App {
  private readonly tenant = inject(TenantStore);

  protected readonly layout = resource({
    params: () => this.tenant.layout(),
    loader: ({ params }) => LAYOUTS[params](),
  });
}
