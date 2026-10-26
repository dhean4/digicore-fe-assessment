import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import meridian from '../../../../public/config/meridian.json';
import { TenantStore } from '../tenant/tenant-store';
import { featureGuard } from './feature-guard';

describe('featureGuard', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const loading = TestBed.inject(TenantStore).load('meridian');
    TestBed.inject(HttpTestingController).expectOne('config/meridian.json').flush(meridian);
    await loading;
  });

  const run = (feature: Parameters<typeof featureGuard>[0]) =>
    TestBed.runInInjectionContext(() => featureGuard(feature)({}, [], {} as never));

  it('lets enabled features match', () => {
    expect(run('loans')).toBe(true);
  });

  it('redirects disabled features to /unavailable', () => {
    const result = run('cards') as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/unavailable');
  });
});
