# SpendWise

SpendWise is an Android-first expense tracker built with Expo SDK 56 and React Native.

## What the app includes

- Dashboard with today, week, month, and lifetime totals
- Add, edit, and delete expense entries
- Searchable and filterable expense history
- Monthly budgets with progress and over-limit warnings
- Recurring reminder scheduling through local Android notifications
- Insights screen with category breakdowns and smart tips
- Local backup export and restore
- Privacy-first local storage with no account requirement

## Android focus

This project is configured for Android release work:

- `platforms` is set to Android in [app.json](/e:/myWebsites/SpendWise/app.json:1)
- Local notifications are configured with `expo-notifications`
- Sharing and backup export are configured with `expo-sharing` and `expo-file-system`

## Stack

- Expo `~56.0.11`
- Expo Router `~56.2.10`
- Expo SQLite `~56.0.5`
- Expo Notifications `~56.0.17`
- React Native `0.85.3`
- TypeScript `~6.0.3`

## Development

Install dependencies:

```bash
npm install
```

Run Android:

```bash
npm run android
```

Useful checks:

```bash
npm run lint
npm run typecheck
npm run doctor
```

## Project layout

- [src/app](/e:/myWebsites/SpendWise/src/app:1): screens and router layout
- [src/database](/e:/myWebsites/SpendWise/src/database:1): persistence and analytics
- [src/services](/e:/myWebsites/SpendWise/src/services:1): notifications and backup handling
- [src/constants](/e:/myWebsites/SpendWise/src/constants:1): categories, colors, and labels
- [src/utils](/e:/myWebsites/SpendWise/src/utils:1): formatting helpers

## Validation

The current app passes:

- `npm run lint`
- `npm run typecheck`
- `npx expo-doctor`
