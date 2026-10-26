import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { TenantStore } from '../tenant/tenant-store';
import { FeatureKey } from '../tenant/tenant.model';

/**
 * `canMatch` instead of `canActivate`: when a feature is off, the route doesn't match at all,
 * so its lazy chunk is never downloaded and the user gets a proper "not available" page.
 *
 * This is a UX boundary, not a security one. The API must enforce the same flags.
 */
export function featureGuard(feature: FeatureKey): CanMatchFn {
  return () => {
    if (inject(TenantStore).isEnabled(feature)) {
      return true;
    }
    const router = inject(Router);
    return router.createUrlTree(['/unavailable'], {
      queryParams: router.currentNavigation()?.extractedUrl.queryParams,
    });
  };
}
