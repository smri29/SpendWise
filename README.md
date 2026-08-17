# SpendWise

SpendWise is a privacy-first Android expense tracker built to help people understand spending with confidence, speed, and zero surveillance.

## Product Identity

- App Name: `SpendWise`
- Tagline: `Local | Private | Simple Budgeting`
- Slogan: `Confidence in your spending, completely on your terms.`
- Author: `Shah Mohammad Rizvi`
- Platform Focus: `Android`
- Storage Model: `100% on-device`
- Network Dependency: `None for core app behavior`

## Product Promise

SpendWise keeps financial logging intentionally simple:

- no login
- no signup
- no cloud sync
- no remote API dependency
- no external analytics SDK
- no third-party tracking

The user owns the data lifecycle, including reminder behavior, backup export, restore, and retention length.

## Logo and Brand Assets

- App icon source: `assets/images/spendwise-icon.png`
- Android adaptive icon sources:
  - `assets/images/spendwise-adaptive-foreground.png`
  - `assets/images/android-icon-background.png`
  - `assets/images/spendwise-adaptive-monochrome.png`
- Splash image source: `assets/images/spendwise-splash-brand.png`

The current brand direction combines a bright budgeting-friendly yellow backdrop with calm navy typography and soft white content cards.

## Core Technology Stack

### Runtime and framework

- Expo `~57.0.13`
- React Native `0.86.2`
- React `19.2.3`
- TypeScript `~6.0.3`

### Navigation

- Expo Router `~57.0.13`
- Drawer navigation via `expo-router/drawer`

### Local platform capabilities

- SQLite via `expo-sqlite`
- Local notifications via `expo-notifications`
- File export and backup via `expo-file-system`
- PDF generation via `expo-print`
- Native sharing via `expo-sharing`
- Haptics via `expo-haptics`

### Interaction and rendering

- `react-native-gesture-handler`
- `react-native-reanimated`
- `react-native-svg`
- `@react-native-community/datetimepicker`

## Design System

### Color palette

- Background gradient start: `#FFFDE7`
- Background gradient end: `#FFF59D`
- Primary card: `#FFFFFF`
- Main text / navy accent: `#1A237E`
- Income: `#2E7D32`
- Expense: `#C62828`

### Design principles

- Glanceable first, detailed second
- Rounded cards and touch targets for comfort
- Low-cognitive-load screen grouping
- Strong semantic color use for money direction
- Clear empty states instead of silent blanks

### UX choices by screen

- Home: today-first dashboard with direct add/view actions
- Add Entry: category-forward form with preview and explicit timestamp control
- View Logs: visible totals, quick filters, destructive delete confirmation
- Analytics: top summary cards before visual breakdown
- Settings: grouped by preference, security, storage, reminder, reports, and privacy domains
- Feedback: trust messaging shown before email-based feedback submission

## Architecture

SpendWise now follows a modular separation technique so route files stay thin and logic lives in focused modules.

```text
src/
├── app/                    Expo Router entry points only
├── components/             Shared UI and navigation building blocks
├── db/
│   ├── core/               Database bootstrap and connection lifecycle
│   └── modules/            Domain-specific SQLite access modules
├── features/
│   ├── add-entry/          Add flow hook, sections, constants, styles
│   ├── analytics/          Analytics hook and mounted screen modules
│   ├── feedback/           Feedback screen module and styles
│   ├── home/               Dashboard hook and screen module
│   ├── settings/           Settings hook and section components
│   └── view-logs/          History hook, header, empty state, table
├── services/               Notifications and cross-cutting local behavior
├── theme/                  Brand tokens
└── utils/                  Formatting, guards, and parsing helpers
```

## Architectural Decisions

### 1. Thin router files

`src/app/(drawer)/*.tsx` now act as mother pages that simply mount feature screens. This keeps navigation stable and prevents route files from growing into large business-logic containers.

### 2. Feature-local composition

Each feature owns:

- a screen component
- one or more child sections
- constants
- styles
- a dedicated hook when state orchestration is non-trivial

### 3. Domain-separated database modules

SQLite code is no longer concentrated in one file. It is split into:

- `core/database.ts`
- `modules/settings.ts`
- `modules/transactions.ts`
- `modules/analytics.ts`
- `modules/backup.ts`

This reduces coupling and makes future migrations safer.

### 4. Offline-first persistence

All business data is local. Export and restore are user-triggered only.

### 5. UTC timestamp persistence

Transactions store Unix epoch milliseconds and are localized only at render time.

## Database Schema

### `categories`

- `id`
- `name`
- `type`
- `icon_name`
- `color_hex`

### `transactions`

- `id`
- `amount`
- `type`
- `category_id`
- `note`
- `created_at`

### `settings`

- `key`
- `value`

## Seed Data

### Expense categories

- Food & Dining
- Transport
- Shopping
- Bills & Utilities
- Entertainment
- Health
- Other Expense

### Income categories

- Salary
- Freelance
- Investments
- Gifts
- Other Income

### Default settings

- `currency_symbol = $`
- `retention_months = 3`
- `daily_reminder_enabled = true`
- `daily_reminder_time = 20:00`
- `app_lock_enabled = false`
- `pdf_report_last_export_at =`

## Retention and Privacy Behavior

- Local records older than the retention threshold are auto-purged.
- The default retention is 3 months.
- The user can switch retention to 1 month, 3 months, 6 months, or never.
- Purge execution runs on initialization and after relevant settings flows.

## Export, Backup, and Restore

### CSV export

- Exports full transaction history
- Uses file-system API
- Opens native share sheet when available

### JSON backup

- Stores categories, transactions, settings, schema version, and export timestamp
- Validated before restore
- Restored transactionally

## Notification Model

- Local-only Android reminder notifications
- One recurring daily reminder
- User-controlled enable/disable
- User-controlled reminder time

## Current App Screens

### Home

- Today date and time
- Today spent and earned cards
- Quick status card
- Retention notice
- Primary actions

### View Logs

- Type filters
- Period filters
- Visible totals
- Horizontal transaction table
- Delete action and long-press delete

### Add Entry

- Expense/income segmented switch
- Amount input
- Category chips
- Description input
- Date and time picker
- Save and reset actions

### Analytics

- Net balance
- Spent this month
- Earned this month
- Top expense category
- Donut breakdown chart
- Radar trend chart
- CSV export

### Settings

- Currency selector
- App lock toggle
- Retention selector
- Local storage estimate
- JSON backup export
- JSON restore
- PDF report export
- Clear-all-data flow
- Reminder toggle and time
- Privacy summary

### Feedback & About

- Trust strip
- Email feedback form
- Rating stars
- Privacy-first about section

## Inline Documentation Strategy

The codebase includes inline comments primarily in:

- data bootstrap modules
- feature hooks
- public database facade files

The goal is to explain intent and boundaries, not repeat self-evident code.

## Markdown Documentation

Additional docs are available in:

- `docs/architecture.md`
- `docs/ui-ux.md`
- `docs/data-model.md`

## Running the Project

Install dependencies:

```bash
npm install
```

Start Metro:

```bash
npx expo start --port 8082
```

Run Android from the workstation:

```bash
npm run android
```

If Android SDK or `adb` is not configured locally, use:

- Expo Go with a compatible SDK 57 client
- or a development build / APK on a real device

## Validation Commands

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Repository Notes

- Expo Router is configured with `expo-router/entry`
- Android package id: `com.smri29.spendwise`
- React Compiler is enabled
- Typed routes are enabled
- Notifications request Android post-notification permission

## UI Figures

### High-level interaction path

```text
Home
  -> Add Entry
  -> View Logs
       -> Export CSV
  -> Analytics
  -> Settings
       -> Backup / Restore / Reminder / Retention
  -> Feedback & About
```

### Data ownership path

```text
User action
  -> Feature hook
  -> DB module
  -> SQLite
  -> Rendered UI
  -> Optional local export/share
```

## Project Status

The app is structured as a production-oriented offline personal finance tool with modularized screens, modularized SQLite access, local app protection, PDF export support, and supporting markdown documentation for maintenance and extension.
