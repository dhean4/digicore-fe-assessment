import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import aurora from '../../public/config/aurora.json';
import meridian from '../../public/config/meridian.json';
import { App } from './app';
import { routes } from './app.routes';
import { TenantStore } from './part-b/tenant/tenant-store';

async function renderFor(id: string, config: object) {
  TestBed.configureTestingModule({
    imports: [App],
    providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
  });
  const loading = TestBed.inject(TenantStore).load(id);
  TestBed.inject(HttpTestingController).expectOne(`config/${id}.json`).flush(config);
  await loading;

  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  await new Promise((resolve) => setTimeout(resolve));
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

const navLabels = (el: HTMLElement) =>
  [...el.querySelectorAll('.nav-links a')].map((a) => a.textContent?.trim());

describe('App shell (one build, many banks)', () => {
  it('renders Aurora with the sidebar layout and without loans', async () => {
    const el = await renderFor('aurora', aurora);
    expect(el.querySelector('app-sidebar-layout')).not.toBeNull();
    expect(navLabels(el)).toContain('Savings');
    expect(navLabels(el)).not.toContain('Loans');
    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#6d28d9');
  });

  it('renders Meridian with the top-nav layout and without cards or savings', async () => {
    const el = await renderFor('meridian', meridian);
    expect(el.querySelector('app-topnav-layout')).not.toBeNull();
    expect(navLabels(el)).toContain('Loans');
    expect(navLabels(el)).not.toContain('Cards');
    expect(navLabels(el)).not.toContain('Savings');
  });
});
