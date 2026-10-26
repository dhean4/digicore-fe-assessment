import { Type } from '@angular/core';
import { LayoutKey } from '../tenant/tenant.model';

/**
 * A layout key from config maps to a lazily loaded shell component, so a bank only downloads
 * the layout it uses. Adding a layout means one component plus one line here. Banks then
 * choose it in config.
 */
export const LAYOUTS: Record<LayoutKey, () => Promise<Type<unknown>>> = {
  sidebar: () => import('./sidebar-layout').then((m) => m.SidebarLayout),
  topnav: () => import('./topnav-layout').then((m) => m.TopnavLayout),
};
