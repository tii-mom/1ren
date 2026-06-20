# 1ren Backend (Cloudflare Worker & D1)

This directory contains the Cloudflare Worker backend code for the 1ren project, built with Hono and powered by Cloudflare D1 (SQLite database).

## Prerequisites

Ensure you have Node.js (version 18+ recommended) installed.

## Local Development & Setup

Follow these steps to initialize and run the database and worker locally.

### 1. Install Dependencies
Install the required packages:
```bash
npm --prefix worker install
```

### 2. Initialize Local D1 Database
Create and execute the database schema on your local D1 instance (using wrangler local sandbox):
```bash
npx wrangler d1 execute r1-growth-dev --local --file=worker/schema.sql
```

### 3. Run Development Server
Start the local Wrangler development server:
```bash
npm run worker:dev
```
Or run directly using wrangler:
```bash
npx wrangler dev --port 8787
```

---

## API Testing & Verification

Once the development server is running on `http://localhost:8787`, you can verify endpoints using `curl` or any API client.

### 1. Health Check
```bash
curl http://localhost:8787/api/health
```

### 2. Create Session
Generates a new anonymous user, session token, default asset balances, and records a system event:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"referrerCode":"R1XXXXXX"}' http://localhost:8787/api/session/create
```
Example Response:
```json
{
  "sessionToken": "s_tok_53a48e7751db4766be18b0ad2e08cc4b",
  "user": {
    "id": "usr_9d09c2a8f8ef446d",
    "tgId": null,
    "inviteCode": "R1J6K89A",
    "referrerId": null,
    "createdAt": "2026-06-20T17:45:00.000Z"
  }
}
```

### 3. Get User Profile (`/api/me`)
Verify user details using the `sessionToken` returned above (replace `YOUR_SESSION_TOKEN` with the actual token):
```bash
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" http://localhost:8787/api/me
```

### 4. Get Assets (`/api/assets`)
Verify initial default asset balances using the token:
```bash
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" http://localhost:8787/api/assets
```

### 5. Get Device Catalog (`/api/devices/catalog`)
Retrieve available devices templates:
```bash
curl http://localhost:8787/api/devices/catalog
```

### 6. Activate 3-Minute Demo Node (`/api/devices/demo-activate`)
Activate the demo node for 180 seconds:
```bash
curl -X POST -H "Authorization: Bearer YOUR_SESSION_TOKEN" http://localhost:8787/api/devices/demo-activate
```

### 7. Rent Simulated Device (`/api/devices/rent`)
Rent a simulated bronze device (does not deduct real balance):
```bash
curl -X POST -H "Authorization: Bearer YOUR_SESSION_TOKEN" -H "Content-Type: application/json" -d '{"deviceId":"dev_bronze"}' http://localhost:8787/api/devices/rent
```

### 8. Get Active Device Orders (`/api/devices/active`)
Retrieve current user's active/non-expired device orders:
```bash
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" http://localhost:8787/api/devices/active
```

### 9. Get Mining Records (`/api/mining/records`)
Retrieve recent mining records:
```bash
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" http://localhost:8787/api/mining/records
```

---

## View Local D1 Data
To inspect the local SQLite database directly or run custom SQL commands:

```bash
npx wrangler d1 execute r1-growth-dev --local --command="SELECT * FROM users;"
npx wrangler d1 execute r1-growth-dev --local --command="SELECT * FROM sessions;"
npx wrangler d1 execute r1-growth-dev --local --command="SELECT * FROM asset_accounts;"
npx wrangler d1 execute r1-growth-dev --local --command="SELECT * FROM system_events;"
npx wrangler d1 execute r1-growth-dev --local --command="SELECT * FROM devices;"
npx wrangler d1 execute r1-growth-dev --local --command="SELECT * FROM device_orders;"
npx wrangler d1 execute r1-growth-dev --local --command="SELECT * FROM mining_records;"
```
