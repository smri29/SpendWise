# Architecture

## Overview

SpendWise follows a layered offline-first architecture:

1. `src/app`
   Thin Expo Router entry files only.
2. `src/features`
   Screen-level feature modules containing hooks, mounted sections, and styles.
3. `src/components`
   Shared UI pieces reused across multiple screens.
4. `src/db`
   Local SQLite access split by domain:
   - `core`: connection and bootstrapping
   - `modules/settings`
   - `modules/transactions`
   - `modules/analytics`
   - `modules/backup`
5. `src/services`
   Local notification orchestration.
6. `src/utils`
   Formatting, parsing, validation, and backup guards.

## Why This Structure

- Route files stay stable and easy to scan.
- Large screens are broken into mother pages plus mounted subsections.
- Database logic is separated by responsibility instead of one monolithic file.
- Future changes can stay local to a feature folder.

## Navigation Model

- Root layout provides providers and app setup.
- Drawer layout owns cross-screen navigation chrome.
- Each drawer route points to a dedicated feature screen.

## Offline Data Flow

1. User interacts with a feature screen.
2. Feature hook calls a domain function from `src/db`.
3. SQLite persists or queries local data.
4. UI rerenders with derived snapshots.
5. Optional export/backup uses file APIs and native share sheet.
