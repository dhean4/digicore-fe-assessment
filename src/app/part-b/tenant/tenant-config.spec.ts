import aurora from '../../../../public/config/aurora.json';
import defaultBank from '../../../../public/config/default.json';
import meridian from '../../../../public/config/meridian.json';
import { WIDGETS } from '../dashboard/widget-registry';
import { VALIDATOR_REGISTRY } from '../onboarding/validator-registry';
import { APEX_DOMAIN, parseTenantConfig, resolveTenantId } from './tenant-config';

describe('resolveTenantId', () => {
  it('reads the tenant from the production subdomain', () => {
    expect(resolveTenantId({ hostname: `aurora.${APEX_DOMAIN}`, search: '' })).toBe('aurora');
  });

  it('lets ?bank= override the host (demo/QA)', () => {
    expect(resolveTenantId({ hostname: `aurora.${APEX_DOMAIN}`, search: '?bank=meridian' })).toBe(
      'meridian',
    );
  });

  it('falls back to default for unrelated hosts and unsafe ids', () => {
    expect(resolveTenantId({ hostname: 'dhean4.github.io', search: '' })).toBe('default');
    expect(resolveTenantId({ hostname: 'localhost', search: '?bank=../../etc' })).toBe('default');
  });
});

describe('parseTenantConfig', () => {
  it('rejects configs from an unsupported schema version', () => {
    expect(() => parseTenantConfig({ ...aurora, version: 99 })).toThrow(/version/);
  });

  it('rejects unknown layouts', () => {
    expect(() => parseTenantConfig({ ...aurora, layout: 'carousel' })).toThrow(/layout/);
  });
});

// A contract test: every bank config we ship must parse and must only reference widgets and
// validation rules this build knows about. In CI, this is what stops a bad config going live.
describe.each([
  ['default', defaultBank],
  ['aurora', aurora],
  ['meridian', meridian],
])('%s config', (_, raw) => {
  const config = parseTenantConfig(raw);

  it('only uses known dashboard widgets', () => {
    expect(config.dashboard.widgets.filter((key) => !WIDGETS[key])).toEqual([]);
  });

  it('only uses known validation rules', () => {
    const rules = config.onboarding.steps.flatMap((s) =>
      s.fields.flatMap((f) => f.validators ?? []),
    );
    expect(rules.filter((r) => !(r.rule in VALIDATOR_REGISTRY))).toEqual([]);
  });
});
