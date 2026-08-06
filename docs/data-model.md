# Data Model

## Tables

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

## Seeding Rules

- Expense and income categories are created if missing.
- Default settings are inserted if missing.

## Retention Rule

- `retention_months` controls rolling purge.
- `0` means never auto-delete.
- Purge runs during initialization and after settings restore/save paths.

## Backup Contract

- JSON backup stores schema version, export timestamp, categories, transactions, and settings.
- Validation occurs before restore.
- Restores replace local content atomically inside a transaction.
