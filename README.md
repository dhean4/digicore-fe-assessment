# Digicore Frontend Engineer Assessment

These are my answers to both parts of the assessment. The write-ups are in `docs/`, and there's a small runnable Angular 22 app that
backs them up.

**Live demo:** https://dhean4.github.io/digicore-fe-assessment/

| | Write-up | Code |
|---|---|---|
| **Part A:** Broken Banking Transaction UI | [docs/part-a.md](docs/part-a.md) | [`src/app/part-a/`](src/app/part-a) |
| **Part B:** Multi-Bank Custom UI Engine | [docs/part-b.md](docs/part-b.md) | [`src/app/part-b/`](src/app/part-b), [`public/config/`](public/config) |

## TL;DR

**Part A.** The component crashes on load because the service is never injected. It has no error or
loading state, and it crashes again on null categories. It keeps two copies of the same state that
drift apart (a data refresh wipes out the user's search) and leaks its subscription. It also
re-creates the whole DOM on every keystroke: no `trackBy`, no debounce, no virtualisation. The fix
uses a single source of truth (`rxResource`) and a `computed()` filtered view, so there are no
manual subscriptions. It adds a debounced search, `track`-by-id, CDK virtual scrolling, typed money
in minor units with `CurrencyPipe`, and accessible loading, error and empty states.
[Full list of 17 issues →](docs/part-a.md)

**Part B.** One build, with each bank as data. A versioned JSON config is resolved from the
subdomain and loaded before bootstrap. The code provides registries of layouts, widgets and
validation rules, and each bank's config composes from them. Theming is done with CSS custom
properties. Feature flags are enforced through a `canMatch` guard (disabled features never even
download), a structural directive and the API. Configs are schema-checked, contract-tested in CI
and fall back safely if broken. [Design →](docs/part-b.md)

## Try it

```bash
npm install
npm start          # http://localhost:4200
npm test           # Vitest unit + integration tests
npm run build
```

- **Part A:** open **Transactions** and search the 5,000 mock transactions (try `atm` or `SALARY`).
- **Part B:** use the **Demo bank** switcher, or open `/?bank=aurora` or `/?bank=meridian`. The same
  bundle changes theme, layout, navigation, dashboard widgets, onboarding steps and validation
  rules. Try **Open an account** on each bank, and try `/loans` on Aurora.

## Stack and conventions

- Angular 22: standalone components, zoneless change detection, OnPush (the default in v22), signals
  (`computed`, `linkedSignal`, `resource`/`rxResource`), built-in control flow, `inject()`,
  signal `input()`, functional guards, `provideAppInitializer`, typed reactive forms.
- `@angular/cdk` for virtual scrolling.
- Strict TypeScript and `strictTemplates`.
- Vitest (Angular's default runner). The tests cover the Part A component and filter, tenant
  resolution and config parsing, contract tests over every bank config, the validator registry, the
  feature guard, and an integration test that boots the app shell as two different banks.

## Project layout

```
src/app/
  part-a/                  fixed transaction list, filter, mock API, tests
  part-b/
    tenant/                config contract, resolution, parsing, theming, TenantStore
    layout/                layout registry + sidebar/topnav shells, nav, demo bank switcher
    features/              *appIfFeature directive, canMatch feature guard
    dashboard/             widget registry + config-composed dashboard
    onboarding/            config-driven wizard + validator registry
public/config/             one JSON file per bank (fictional banks)
docs/                      written answers
```
