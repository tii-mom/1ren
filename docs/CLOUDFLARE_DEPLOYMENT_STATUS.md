# Cloudflare Deployment Status

## Deployment Date

2026-06-20 (UTC+8)

## Source

- **Main commit**: `44789a4` (docs: plan AI token API consumption flow (PR-4E) (#19))
- **Branch**: `main`
- **Repository**: `tii-mom/1ren`

---

## Backend (Cloudflare Worker)

| Item | Value |
| :--- | :--- |
| Worker name | `r1-growth-worker` |
| Worker URL | `https://r1-growth-worker.348421501.workers.dev` |
| D1 database name | `1ren-db` |
| D1 region | APAC |
| D1 binding | `DB` |
| ADMIN_TOKEN | Configured via `wrangler secret put` (not committed) |

### Applied Migrations

| Migration | Status |
| :--- | :--- |
| `schema.sql` (full init) | ✅ Applied via `wrangler d1 execute` |
| `0002_devices_catalog_fields.sql` | ✅ Covered by schema.sql, registered in `d1_migrations` |
| `0003_system_configs.sql` | ✅ Covered by schema.sql, registered in `d1_migrations` |

### Remote Tables

- `_cf_KV`
- `asset_accounts`
- `d1_migrations`
- `device_orders`
- `devices`
- `ledger_entries`
- `mining_records`
- `sessions`
- `system_configs`
- `system_events`
- `users`

---

## Frontend (Cloudflare Pages)

| Item | Value |
| :--- | :--- |
| Pages project name | `1ren` |
| Pages production URL | `https://1ren.pages.dev` |
| Build tool | Vite |
| Build command | `VITE_API_BASE_URL=<worker_url> npm run build` |
| Output directory | `dist` |
| API Base URL | Worker production URL (set via `VITE_API_BASE_URL` at build time) |

---

## Smoke Test Results

### Worker API

| Endpoint | Expected | Result |
| :--- | :--- | :--- |
| `GET /api/health` | 200 | ✅ PASS |
| `GET /api/devices/catalog` | 200, returns device list | ✅ PASS (6 devices returned) |
| `GET /api/admin/devices` (no token) | 401 | ✅ PASS |
| `GET /api/admin/devices` (wrong token) | 401 | ✅ PASS |

### Frontend

| Check | Result |
| :--- | :--- |
| `https://1ren.pages.dev` returns 200 | ✅ PASS |
| HTML contains correct JS bundle hash | ✅ PASS |
| JS bundle contains production Worker URL | ✅ PASS |

### CORS

| Check | Result |
| :--- | :--- |
| Worker returns `access-control-allow-origin: *` | ✅ PASS |
| Cross-origin request from Pages to Worker | ✅ PASS |

---

## Code Changes for Deployment

The following minimal changes were made to support production deployment:

1. **`worker/wrangler.toml`**: Updated `database_name` and `database_id` to point to production D1.
2. **`src/api/admin.ts`**: Exported `API_BASE_URL` constant.
3. **`src/components/AdminPanel.tsx`**: Replaced hardcoded `http://localhost:8787` fetch URL with dynamic `API_BASE_URL` import.

---

## Security Checklist

| Check | Result |
| :--- | :--- |
| `.env` is in `.gitignore` | ✅ Ignored |
| `.dev.vars` is in `.gitignore` | ✅ Ignored |
| `worker/.dev.vars` is in `.gitignore` | ✅ Ignored |
| No real secrets tracked by Git | ✅ Verified |
| ADMIN_TOKEN stored as Cloudflare Worker Secret | ✅ Configured |
| No default ADMIN_TOKEN fallback in code | ✅ Fail-closed |

---

## Notes

- The wrangler.toml file contains the D1 `database_id`. This is a non-secret identifier required by Cloudflare for binding and is safe to commit.
- For production ADMIN_TOKEN management, use `npx wrangler secret put ADMIN_TOKEN` from the `worker/` directory.
- Frontend builds require setting `VITE_API_BASE_URL` to the Worker URL before running `npm run build`.
- The Worker CORS policy is currently set to `origin: "*"`. This is acceptable for the current MVP stage but should be restricted to the Pages domain in production hardening.
