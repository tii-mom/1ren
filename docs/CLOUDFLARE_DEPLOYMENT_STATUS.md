# Cloudflare Deployment Status

## Deployment Date

2026-06-20 (UTC+8)

## Source

- **Main commit**: `44789a4` (docs: plan AI token API consumption flow (PR-4E) (#19))
- **Branch**: `main`
- **Repository**: `tii-mom/1ren`

---

## Custom Domain

| Domain | Target | Purpose |
| :--- | :--- | :--- |
| `tai.lat` | Cloudflare Pages (`1ren`) | 前端生产域名 |
| `api.tai.lat` | Cloudflare Worker (`r1-growth-worker`) | 后端 API 域名 |

### DNS Records (Cloudflare Zone: tai.lat)

| Record | Type | Content | Proxied |
| :--- | :--- | :--- | :--- |
| `tai.lat` | CNAME | `1ren.pages.dev` | ✅ |
| `api.tai.lat` | AAAA | Cloudflare Workers (auto-managed) | ✅ |

### SSL / Custom Domain Status

| Domain | Status | Validation | Verification |
| :--- | :--- | :--- | :--- |
| `tai.lat` (Pages) | `active` | `active` | `active` |
| `api.tai.lat` (Worker custom_domain) | `active` | — | — |

---

## Backend (Cloudflare Worker)

| Item | Value |
| :--- | :--- |
| Worker name | `r1-growth-worker` |
| Worker custom domain | `https://api.tai.lat` |
| Worker fallback URL | `https://r1-growth-worker.348421501.workers.dev` |
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
| Pages custom domain | `https://tai.lat` |
| Pages fallback URL | `https://1ren.pages.dev` |
| Build tool | Vite |
| Build command | `VITE_API_BASE_URL=https://api.tai.lat npm run build` |
| Output directory | `dist` |
| API Base URL | `https://api.tai.lat` (set via `VITE_API_BASE_URL` at build time) |

---

## Smoke Test Results

### Worker API (via `api.tai.lat`)

| Endpoint | Expected | Result |
| :--- | :--- | :--- |
| `GET /api/health` | 200, `"service":"1ren-backend-d1"` | ✅ PASS |
| `GET /api/devices/catalog` | 200, returns device list | ✅ PASS (6 devices: L0-L5) |
| `GET /api/admin/devices` (no token) | 401 | ✅ PASS |
| `GET /api/admin/devices` (wrong token) | 401 | ✅ PASS |

### Frontend (via `tai.lat`)

| Check | Result |
| :--- | :--- |
| `https://tai.lat` returns 200 | ✅ PASS |
| HTML contains correct JS bundle hash | ✅ PASS |
| JS bundle contains `api.tai.lat` | ✅ PASS |

### CORS

| Check | Result |
| :--- | :--- |
| Worker returns `access-control-allow-origin: *` | ✅ PASS |
| Cross-origin from `tai.lat` to `api.tai.lat` | ✅ PASS |

---

## Code Changes for Deployment

The following minimal changes were made to support production deployment:

1. **`worker/wrangler.toml`**: Updated `database_name` and `database_id` to point to production D1; added `routes` with `api.tai.lat` custom domain.
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
- Frontend builds require setting `VITE_API_BASE_URL=https://api.tai.lat` before running `npm run build`.
- The Worker CORS policy is currently set to `origin: "*"`. This is acceptable for the current MVP stage but should be restricted to `https://tai.lat` in production hardening.

---

## Domain Reset & Verification (2026-06-21)

To ensure the production domain resolves stably, a complete domain reset and verification process was performed:
- **Root Domain Re-binding**: `tai.lat` custom domain was fully detached and reattached to Pages project `1ren`.
- **Legacy Cleanup**: Removed custom domain bindings from the legacy `taiprotocol-website` Pages project.
- **Worker Routes & Domains**: Worker routes and custom domains were verified; `api.tai.lat` points exclusively to Worker `r1-growth-worker`, and all legacy Worker routes/domains mapping to `tai.lat` or `www.tai.lat` were cleared.
- **www Subdomain**: `www.tai.lat` was intentionally left unbound.
- **Cache Purging**: Initiated a zone-wide cache purge configuration review.
- **Production Deployment URL**: Frontend deployed to https://9725cf66.1ren.pages.dev
- **External Verification**: Verified that `tai.lat` external routing maps correctly to `1ren.pages.dev` and serves the 1ren site without any legacy content or TAI Protocol references.
