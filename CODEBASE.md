# CODEBASE.md — Service Reminder Frontend

## 1. Project Structure & Architecture

```
service-reminder-frontend/
├── src/
│   ├── index.html
│   ├── main.ts                          # App bootstrap (standalone)
│   ├── main.server.ts                   # SSR bootstrap (commented out)
│   ├── styles.css                       # Global styles (shared classes, reset)
│   ├── material-theme.scss              # Angular Material M3 theme
│   ├── guards/
│   │   └── auth.guard.ts                # Route guard (checks localStorage)
│   ├── app/
│   │   ├── app.ts / .html / .css        # Root component (Navbar + RouterOutlet)
│   │   ├── app.config.ts                # App-wide providers (router, HTTP, validation)
│   │   ├── app.config.server.ts         # SSR config (merge)
│   │   ├── app.routes.ts                # All routes (lazy-loaded)
│   │   ├── app.routes.server.ts         # SSR route config
│   │   ├── components/                  # Feature components (pages + forms)
│   │   │   ├── home/                    # Landing page (hero card)
│   │   │   ├── login/                   # Login page + form
│   │   │   ├── signup/                  # Signup page + form
│   │   │   ├── navbar/                  # Top navigation bar
│   │   │   ├── dropdown/                # Generic dropdown menu (actions)
│   │   │   ├── user-profile/            # User profile page
│   │   │   └── recurring-item/          # Recurring items feature + form
│   │   ├── pages/                       # Entity pages (smart + dumb form)
│   │   │   ├── appointment/             # Appointments CRUD + form
│   │   │   ├── service/                 # Services CRUD + form
│   │   │   └── vendor/                  # Vendors CRUD + form
│   │   ├── shared/                      # Reusable shared components
│   │   │   ├── generic-button/          # Reusable action button
│   │   │   ├── generic-input/           # Reusable form input
│   │   │   ├── generic-dropdown/        # Reusable single-select dropdown
│   │   │   ├── generic-multi-select/    # Reusable multi-select dropdown
│   │   │   ├── buttons/
│   │   │   │   ├── cancel-button/       # Cancel button wrapper
│   │   │   │   └── save-button/         # Save/Submit button wrapper
│   │   │   └── shared.service.ts        # BaseService (abstract CRUD base)
│   │   ├── services/                    # API services
│   │   │   ├── auth/                    # AuthService (login, signup, session)
│   │   │   ├── appointment/             # AppointmentService
│   │   │   ├── recurring-item/          # RecurringItemService
│   │   │   ├── service/                 # ServiceApiService
│   │   │   └── vendor/                  # VendorService
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts      # Adds Bearer token to requests
│   │   └── validation/
│   │       ├── validation-messages.ts    # Error message resolvers
│   │       └── validation-messages.token.ts  # InjectionToken for messages
├── tailwind.config.js                   # Content paths only (Tailwind v4)
├── angular.json                         # Build config, global styles, budgets
├── package.json                         # Angular 21.2 standalone app
```

### Architecture Pattern
- **Angular 21.2 standalone** — no NgModules, all components are `standalone: true`
- **Lazy-loaded routes** — all feature routes use `loadComponent`
- **Smart + Dumb component pattern** — Page owns logic/services, Form owns the FormGroup
- **Signals** for state management — `signal()`, `computed()`, no NgRx
- **Shared library** — `service_reminder_common` (v4.0.2-beta.10) provides all entity models, DTOs, enums (EntityList, IRecurringItemEntity, etc.), and utilities
- **API base URL** — `http://localhost:3000/api/v1`
- **Auth** — JWT token stored in `localStorage`, injected via `authInterceptor`

---

## 2. All Components & Purpose

### Root
| Component | Selector | Purpose |
|-----------|----------|---------|
| `App` | `app-root` | Renders Navbar + `<router-outlet>` |

### Feature Components (Smart — inject services, own signals)
| Component | Selector | Route | Purpose |
|-----------|----------|-------|---------|
| `Home` | `app-home` | `/home` | Landing hero with Login/Signup buttons |
| `Login` | `app-login` | `/login` | Auth login, delegates form to `LoginFormModel` |
| `Signup` | `app-signup` | `/signup` | Auth signup, delegates form to `SignupFormModel` |
| `Navbar` | `app-navbar` | — | Fixed top nav, links, profile dropdown |
| `UserProfile` | `app-user-profile` | `/profile` | Shows user info, logout button |
| `RecurringItem` | `app-recurring-item` | `/recurring_item` | CRUD table + form |
| `Appointment` | `app-appointment` | `/appointment` | CRUD table + form with status actions |
| `Service` | `app-service` | `/service` | CRUD table + form |
| `Vendor` | `app-vendor` | `/vendor` | CRUD table + form |

### Dumb Form Components (own FormGroup, no service injection)
| Component | Selector | Parent Smart Component |
|-----------|----------|----------------------|
| `LoginFormModel` | `app-login-form` | `Login` |
| `SignupFormModel` | `app-signup-form` | `Signup` |
| `RecurringItemFormComponent` | `app-recurring-item-form` | `RecurringItem` |
| `AppointmentFormComponent` | `app-appointment-form` | `Appointment` |
| `ServiceFormComponent` | `app-service-form` | `Service` |
| `VendorFormComponent` | `app-vendor-form` | `Vendor` |

### Shared/Reusable Components
| Component | Selector | Purpose |
|-----------|----------|---------|
| `GenericButtonComponent` | `app-generic-button` | Action button with loading state |
| `GenericInputComponent` | `app-generic-input` | Form input with validation error display |
| `GenericSelectComponent` | `app-generic-select` | Searchable single-select dropdown |
| `GenericMultiSelectComponent` | `app-generic-multi-select` | Searchable multi-select with checkboxes |
| `CancelButtonComponent` | `app-cancel-button` | Wraps GenericButton with "Cancel" text |
| `SubmitButtonComponent` | `app-submit-button` | Wraps GenericButton with "Save" text |
| `DropdownMenuComponent` | `app-dropdown-menu` | Generic action menu (items with danger/icon) |

---

## 3. Code Conventions & Patterns

### File Naming
| Type | Pattern | Example |
|------|---------|---------|
| Smart component | `[feature].ts / .html / .css` | `appointment.ts` |
| Dumb form | `[feature]-form.model.ts / .html / .css` | `appointment-form.model.ts` |
| Services | `[entity].service.ts` | `vendor.service.ts` |
| Interceptors | `[name].interceptor.ts` | `auth.interceptor.ts` |
| Guards | `[name].guard.ts` | `auth.guard.ts` |

### Smart + Dumb Form Pattern
**Smart component:**
- Injects services (e.g. `RecurringItemService`, `AuthService`)
- Owns `error = signal('')`, `isFormOpen` signals
- Defines `onSubmit = (value: FormValue) => Observable<any>` method
- Passes `[submitHandler]="onSubmit"` to the form component
- Never owns a FormGroup

**Dumb form component:**
- Owns `form: FormGroup` with validators
- Accepts `submitHandler = input.required<(value: FormValue) => Observable<any>>()`
- Exposes `handleSubmit = () => Observable<any> | void` — zero-arg wrapper that calls `markAllAsTouched()`, checks `form.invalid`, then calls `submitHandler()(form.getRawValue())`
- Uses `GenericInputComponent`, `GenericSelectComponent`, `GenericMultiSelectComponent`, `GenericButtonComponent`
- Never injects services

### Form Submission via GenericButtonComponent
```
app-generic-button receives [handler]="handleSubmit"
  → handleClick() calls handler()
  → if it returns Observable, sets _processing=true, subscribes, disables button
  → finalize() resets _processing
```

### Shared Library Usage
All entity types, DTOs, enums come from `service_reminder_common`:
- `EntityList` — route path constants (`RECURRING_ITEM`, `APPOINTMENT`, `SERVICE`, `VENDOR`)
- `IRecurringItemEntity`, `IAppointmentEntity`, `IVendorEntity`, `IServiceEntity`, `IUserEntity`
- `ILoginResponse`, `IUserCreateDto`
- `ServicePeriodUnit`, `AppointmentType`, `AppointmentAction`, `UserRole`
- `EntityFilterDataHelper` — for loading entity relations
- `DateCodeUtils` — date formatting utilities
- `IEntityFilterSearchData`, `ISearchV2Response`

### Services Pattern
- `AuthService` — standalone, uses `HttpClient` directly
- `BaseService` (abstract) — provides `baseSearch()` for entity search
- Entity services extend `BaseService`: `RecurringItemService`, `AppointmentService`, `ServiceApiService`, `VendorService`
- Each entity service has `search()`, `create()`, `update()`, `delete()` methods

### Validation
- Globally registered via `VALIDATION_MESSAGES_TOKEN` in `app.config.ts`
- Error message resolvers: `required`, `email`, `minlength`, `maxlength`, `pattern`, `min`, `max`
- Components use `viewProviders` with `ControlContainer` to bind to parent FormGroup
- Error display logic in `GenericInputComponent`: checks `control.errors && (control.touched || control.dirty)`

### Routing
- All feature routes lazy-loaded with `loadComponent`
- Auth-guarded routes: `recurring_item`, `appointment`, `service`, `vendor` (via `authGuard`)
- `auth.guard.ts` checks `localStorage` for `token` and `user`, redirects to `/login` if missing
- SSR safe: `isPlatformBrowser` guard

### Styling
- Tailwind CSS v4 for utility classes
- Global styles in `styles.css` — DO NOT redefine in component CSS
- Component-specific SCSS/CSS for unique styles only
- Angular Material theme in `material-theme.scss` (M3, cyan primary, orange tertiary)
- Buttons get class via `btnClass` input on `GenericButtonComponent`

### Responsiveness
- Every component must be responsive
- Breakpoints: Mobile ≤480px, Tablet ≤768px, Desktop >768px (default)
- Multi-column form rows collapse to single column on mobile
- Tables get `overflow-x: auto` on mobile
- Font sizes reduce on mobile
- Touch targets minimum 44px tall on mobile

### Do NOTs
- Do NOT add `MatInputModule`, `MatFormFieldModule` to form components
- Do NOT redefine `.page-shell`, `.card`, `.submit-button`, `.field`, `.error-message` in component CSS
- Do NOT use `FormsModule` — always `ReactiveFormsModule`
- Do NOT create new services or interfaces unless explicitly asked
- Do NOT use `ViewChild`, `pendingValue`, or workarounds for form submission

---

## 4. Theme & Design System

### Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| **Primary** | `#6ee7b7` | Submit buttons, links, focus borders, active nav links, app name, success accents |
| **Primary Hover** | `#4dd4a0` | Submit button hover state |
| **Error / Danger** | `#f87171` | Error messages, error borders, logout buttons, danger menu items |
| **Error Hover** | `#ef4444` | Logout button hover |
| **Success Text** | `#a7f3d0` | Success message display |

### Background Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Page background** | `#0d0d0d` | Body, page-shell, app root |
| **Card background** | `#1a1a1a` | .card, dropdown panels, profile menu, select trigger |
| **Input background** | `#111111` | Input fields (slightly darker than cards) |
| **Profile trigger bg** | `#1a1a1a` | Profile icon button |
| **Profile hover bg** | `#222222` | Profile trigger hover |
| **Search input bg** | `#0d0d0d` | Search fields inside dropdown panels |
| **Menu item hover** | `rgba(255,255,255,0.05)` | Profile menu items hover |
| **Danger menu hover** | `rgba(248,113,113,0.08)` | Logout/danger menu item hover |
| **Table row hover** | `rgba(110,231,183,0.05)` | Table rows hover highlight |
| **Dropdown option hover** | `rgba(110,231,183,0.08)` | Dropdown option hover |
| **Dropdown option selected** | `rgba(110,231,183,0.12)` | Selected dropdown option |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Heading / Primary text** | `#ffffff` | Body text, h1, table headers, labels on dark bg |
| **Body / Table data** | `#c4c4c4` | Table cell text, footer text, muted labels |
| **Label text** | `#d0d0d0` | Form field labels |
| **Placeholder text** | `#555555` | Input placeholders |
| **Component placeholder** | `#6b7280` | Dropdown placeholder, chevron, no-results, search placeholder |
| **Hero subtitle** | `#888888` | Subtitle text on home page, profile field labels |
| **Link / Active link** | `#6ee7b7` | All links, active nav link |
| **Link hover** | `#6ee7b7` | Nav link hover (color stays same, bg changes) |
| **Error text** | `#f87171` | Error messages, validation hints |

### Border Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Default border** | `#2a2a2a` | Cards, inputs, navbar bottom, table rows, dropdown panels, profile trigger |
| **Hover border** | `#3a3a3a` | Select trigger hover, profile trigger hover |
| **Focus border** | `#6ee7b7` | Input focus, select trigger open, search input focus |
| **Error border** | `#f87171` | Input error state (has-error) |
| **Scrollbar thumb** | `#3a3a3a` | Custom scrollbar |
| **Scrollbar track** | `#1a1a1a` | Custom scrollbar track |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| **Card radius** | `12px` (mobile: `10px`) | Cards, profile menus |
| **Button radius** | `8px` | Submit buttons, action buttons, main CTA buttons, dropdown panels, profile menu items |
| **Input radius** | `6px` | Input fields, nav links, select trigger, profile trigger |
| **Action btn radius** | `4px` | Table action icon buttons |
| **Badge radius** | `4px` | Multi-select count badge |
| **Scrollbar thumb** | `4px` | Custom scrollbar |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| **Dropdown shadow** | `0 8px 24px rgba(0, 0, 0, 0.4)` | Dropdown panels |
| **Profile menu shadow** | `0 10px 30px rgba(0, 0, 0, 0.45)` | Profile dropdown menu |

### Transitions

| Pattern | Duration | Easing | Usage |
|---------|----------|--------|-------|
| Background / color | `0.15s` | ease | Buttons, inputs, menu items, borders |
| Transform | `0.2s` | ease | Chevron rotation, nav link hover |
| All | `0.2s` | ease | Nav links |
| Opacity | `0.15s` | ease | Button disabled state |

### On-Hover Color Changes

| Element | Normal | Hover |
|---------|--------|-------|
| Submit button | bg `#6ee7b7`, text `#0d0d0d` | bg `#4dd4a0` |
| Outline button | bg transparent, text `#6ee7b7`, border `#6ee7b7` | `translateY(-1px)` lift |
| Nav link | text `#c4c4c4`, bg transparent | bg `#ffffff`, text `#6ee7b7` |
| Profile trigger | bg `#1a1a1a`, text `#c4c4c4`, border `#2a2a2a` | bg `#222`, text `#fff`, border `#3a3a3a` |
| Menu item | bg transparent, text `#c4c4c4` | bg `rgba(255,255,255,0.05)`, text `#fff` |
| Danger menu item | bg transparent, text `#c4c4c4` | bg `rgba(248,113,113,0.08)`, text `#f87171` |
| Select trigger | border `#2a2a2a` | border `#3a3a3a` |
| Select trigger (open) | border `#6ee7b7` | — |
| Table row | — | bg `rgba(110,231,183,0.05)` |
| Dropdown option | text `#c4c4c4` | bg `rgba(110,231,183,0.08)`, text `#fff` |
| Action icon btn | bg transparent | bg `rgba(0,0,0,0.08)` |
| Logout button | bg `#f87171`, text `#0d0d0d` | bg `#ef4444` |
| Input / Search input | border `#2a2a2a` | focus: border `#6ee7b7` |
| Input error | border `#f87171` | focus: border stays `#f87171` |
| Link (`footer-text a`) | text `#6ee7b7`, no underline | text-decoration: underline |

### Spacing & Padding Conventions

| Context | Value |
|---------|-------|
| Page shell padding (desktop) | `24px` (auth/center); `40px 48px` (list pages) |
| Page shell padding (mobile) | `16px` (auth); `24px 16px` (list) |
| Page shell top padding | `calc(56px + 24px)` (desktop), `calc(56px + 16px)` (mobile) for auth; `calc(56px + original)` for lists |
| Card padding | `40px` (desktop), `28px 20px` (mobile) |
| Form gap (grid) | `16px` |
| Form row gap (flex) | `16px` |
| Field bottom margin | `18px` (desktop), `16px` (mobile) |
| Field label-input gap | `8px` |
| Input padding | `10px 14px` (desktop), `12px 14px` (mobile) |
| Button padding | `12px 14px` (desktop), `14px` (mobile) |
| Table cell padding | `12px 14px` |
| Navbar padding | `0 32px` (desktop), `0 16px` (mobile) |
| Nav links gap | `24px` |
| Nav link padding | `8px 12px` |
| Profile menu padding | `6px` container, `12px` menu items |
| Dropdown option padding | `10px 14px` |
| Search input padding | `8px 10px` |
| Section gap (list pages) | `24px` |
| h1 bottom margin | `24px` |
| Footer text top margin | `24px` |
| Error message top margin | `18px` |
| Button top margin | `4px` |
| Chevron icon size | `1.1rem` (material icon) |
| Dropdown panel top offset | `calc(100% + 4px)` |
| Profile menu top offset | `calc(100% + 10px)` |
| Multi-select badge padding | `2px 6px` |
| Action button padding | `4px` |
| Action button gap in cell | `8px` |

### Typography

| Property | Value |
|----------|-------|
| **Primary font** | `'DM Sans', sans-serif` — used everywhere (body, labels, buttons, inputs, navbar, menus) |
| **Angular Material font** | `Roboto` (used by Material components only) |
| **Font weights available** | `400`, `500`, `600` (imported); home page also loads `700` |
| **h1 size** | `1.9rem` (desktop), `1.6rem` (mobile); home hero `3rem` |
| **Body / nav link size** | `0.95rem` |
| **Table header size** | `0.92rem` |
| **Error message size** | `0.9rem` (global), `0.82rem` (field error hint) |
| **Footer text size** | `0.95rem` |
| **App name size** | `1.1rem` |
| **Label size** | `0.95rem` (input), `0.875rem` (dropdown), `0.82rem` (profile field label) |
| **Button text size** | `1rem` |
| **Input text size** | `1rem` |
| **Chevron size** | `1.1rem` |
| **Badge size** | `0.8rem` |
| **Search input size** | `0.875rem` |
| **Profile field value** | `1rem` (desktop), `0.95rem` (mobile) |
| **Submit button weight** | `500` |
| **App name weight** | `600` |
| **Table header weight** | `600` |
| **Dropdown selected weight** | `500` |
| **Profile label transform** | `uppercase` with `letter-spacing: 0.05em` |

### Tailwind Config
```js
// tailwind.config.js — v4 minimal
content: ['./src/**/*.{html,ts}'];
```

No custom theme extensions or colors defined in Tailwind — all colors are explicit hex values in CSS/SCSS files.

### CSS Variables (Angular Material)
The `material-theme.scss` sets M3 CSS variables via `mat.theme()`:
- `--mat-sys-surface` — surface background
- `--mat-sys-on-surface` — text on surface
- `--mat-sys-body-medium` — body font
- Material `$cyan-palette` as primary, `$orange-palette` as tertiary

### Global Styles (`styles.css`)
These classes are defined globally and must NOT be redefined in component CSS:
- `.page-shell` — centered layout shell for auth; overridden in list pages with different padding
- `.card` — dark card container (max-width 380px, bg `#1a1a1a`, border `#2a2a2a`, radius 12px, padding 40px)
- `.card h1` — card heading style
- `.submit-button` — full-width primary action button
- `.error-message` — error text display
- `.footer-text` — footer text with link
- `.flex-between-center` — Tailwind utility mixin

### Global Reset (in `styles.css`)
```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'DM Sans', sans-serif;
  background: #0d0d0d;
  color: #ffffff;
  min-height: 100vh;
}
```

---

## 5. Reusable Patterns & How to Follow Them

### Creating a New Feature (e.g. "widget")

1. **Create folder**: `src/app/pages/widget/` (or `src/app/components/widget/` for non-entity features)
2. **Smart component**: `widget.ts` — inject service, own signals, define `onSubmit(value)`, import the form
3. **Smart template**: `.page-shell` layout, heading, child form component, table/display, error state
4. **Dumb form component**: `widget-form.model.ts` — FormGroup, validators, `submitHandler` input, `handleSubmit` method
5. **Dumb form template**: `<form [formGroup]="form">` with `app-generic-input`, `app-generic-select`, `app-generic-button`
6. **Service**: `widget.service.ts` — extend `BaseService` if CRUD, add `search/create/update/delete`
7. **Route**: Lazy-loaded in `app.routes.ts` with `authGuard`

### Form Row Pattern
```html
<div class="form-row">
  <app-generic-input label="Field A" controlName="fieldA" />
  <app-generic-input label="Field B" controlName="fieldB" />
</div>
```
CSS always: `.form-row { display: flex; gap: 16px; }` with children `flex: 1; min-width: 0`

### List Table Pattern
```html
<div class="page-shell">
  <div class="flex-between-center">
    <h1>Title</h1>
    <app-generic-button [handler]="onClickAdd" btnClass="submit-button">Add</app-generic-button>
  </div>
  <table class="items-table">
    <thead><tr><th>Col 1</th><th>Actions</th></tr></thead>
    <tbody>
      @for (item of items(); track item.id) {
        <tr>
          <td>{{ item.field }}</td>
          <td class="actions-cell">
            <button class="action-btn" (click)="onEdit(item)">✏️</button>
          </td>
        </tr>
      }
    </tbody>
  </table>
</div>
```

### Button Conventions
| Class | Usage | Background | Text | Border |
|-------|-------|------------|------|--------|
| `submit-button` | Primary action (Save, Add, Login) | `#6ee7b7` | `#0d0d0d` | none |
| `button-primary` | Home page CTA | `#6ee7b7` | `#0d0d0d` | transparent |
| `button-outline` | Secondary action (Cancel) | transparent | `#6ee7b7` | `1px solid #6ee7b7` |
| `.action-btn` | Table icon actions | none (transparent) | inherit | none |

---

## 6. Global Styles & Theme Files

### Load Order (from `angular.json`)
1. `src/material-theme.scss` — Angular Material M3 theme (cyan primary, orange tertiary)
2. `src/styles.css` — Global reset, shared classes, Tailwind import

### Import Chain
- `styles.css` → imports Google Fonts (`DM Sans`) and `tailwindcss`
- `material-theme.scss` → imports `@angular/material` theming
- `index.html` → imports `Roboto` font and `Material Icons` font

### Component Style Usage
- Smart components: use `.css` (e.g., `recurring-item.css`)
- Dumb form components: use `.css` (e.g., `recurring-item-form.css`)
- Navbar: uses `.scss` (e.g., `navbar.scss`)
- Shared components: use `.scss` (e.g., `generic-input.scss`)

### Key File: `COPILOT_CONTEXT.md`
This file contains the canonical reference for breakpoints, colors, component patterns, and DO NOTs. Any changes to design conventions must be reflected in both `CODEBASE.md` and `COPILOT_CONTEXT.md`.

### Key File: `AGENTS.md`
Instructs AI agents to always read CODEBASE.md before making changes and to never deviate from the theme/design system documented here.
