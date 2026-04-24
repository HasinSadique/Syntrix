# Syntrix

Syntrix is a multi-tenant NDIS operations management SaaS prototype for the Australian NDIS providers.

## Tech stack

- Next.js App Router
- React
- JavaScript
- Tailwind CSS
- shadcn-style UI primitives
- MongoDB + Mongoose
- JWT auth (HTTP-only cookie)
- Zod validation

## Run locally

```bash
npm install
npm run seed
npm run dev
```

## Demo credentials

- Email: `superadmin@syntrix.com`
- Password: `Password123!`

## Initial architecture

```text
src/
  app/
    (auth)/login/
    (app)/dashboard/
    (app)/participants/
    (app)/workers/
    (app)/roster/
    (app)/compliance/
    (app)/documents/
    (app)/companies/
    api/auth/{login,logout,me}/
  backend/
    auth/
    config/
    constants/
    db/
    models/
    services/
    validators/
  components/
    common/
    dashboard/
    layout/
    providers/
    theme/
    ui/
  frontend/
    navigation/
  lib/
scripts/
  seed.js
```

## Current scope implemented

- Tenant-ready data models (first batch): `Company`, `Role`, `User`, `WorkerProfile`, `Participant`
- Authentication route handlers (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`)
- Route protection via middleware + server guards
- Role-aware sidebar navigation
- Dashboard foundation with dark/light mode toggle
- UI placeholders for Roster, Compliance, and Documents (S3 deferred intentionally)

# Syntrix

Syntrix is a multi-tenant NDIS operations management prototype built with Next.js App Router and MongoDB.

This version is **MongoDB-only** (dummy data and dummy repositories removed).

It includes:

- Public landing + auth
- Role-based workspaces (`superadmin`, `company_admin`, `state_manager`, `support_worker`)
- Company, staff, participant, roster/assignment, notes, incidents
- Budgets and performance insights
- Worker availability and clock logs
- Platform/company audit logs with log type filtering

## Tech Stack

- Next.js (App Router, JavaScript)
- React
- Tailwind CSS
- shadcn-style component structure
- Mongoose
- bcryptjs
- jsonwebtoken
- cookie
- nodemailer
- axios

## Architecture

Layered backend design:

- **API routes** call controllers only
- **Controllers** orchestrate request/response concerns
- **Services** contain business logic
- **Repositories** handle data access
- **Config** handles DB/auth/mailer
- **Mongo models/repositories** live in `src/backend/models` and `src/backend/repositories/mongo`

## Multi-Tenancy

- All company-owned entities include `companyId`
- Company queries are filtered by `companyId`
- API guards enforce role and company scoping
- Middleware protects routes and redirects by role

## Key Business Rules Implemented

- One active `state_manager` per state (per company)
- Participant can have max **3 support workers per 24 hours**
- Support worker can work max **8 hours per 24 hours**
- Support workers can set availability and view schedules
- Support worker hourly rate is view-only for support workers
- Assignments support `chargePerHour` for participant billing
- Participant budget fields (`totalBudget`, `allocatedBudget`, `availableBudget`)
- Audit trail in `logs` collection with `logType` on each record

## Seeded Credentials (via API)

After running seed endpoint, all seeded accounts use:

- Password: `Password123!`

- **Superadmin**: `superadmin@syntrix.com`
- **Company Admin (Care Horizons)**: `sarah@carehorizons.com`
- **State Manager (Care Horizons NSW)**: `noah@carehorizons.com`
- **Support Worker (Care Horizons)**: `liam@carehorizons.com`
- **Company Admin (Bright Path Support)**: `daniel@brightpathsupport.com`

## Email Architecture

Core files:

- `src/backend/config/mailer.js`
- `src/backend/services/emailService.js`
- `src/backend/emails/templates/*`
- `src/backend/emails/helpers/renderEmailTemplate.js`
- `src/backend/emails/helpers/emailSubjects.js`

Service usage:

```js
await sendEmail({
  to: "admin@company.com",
  subject: "Welcome to Syntrix",
  templateName: "companyWelcome",
  data: {
    companyName: "Care Horizons",
    adminName: "Sarah Ahmed",
    message: "Your company has been registered successfully.",
  },
});
```

If SMTP env vars are missing, Syntrix uses a safe mock email transport that logs output for development.

## Folder Structure (Core)

```txt
src/
  app/
    api/
    (public)/
    (auth)/
    (dashboard)/
  frontend/
    components/
    hooks/
    services/
    utils/
  backend/
    config/
    models/
    repositories/
    services/
    controllers/
    emails/
    utils/
middleware.js
```

## API Highlights

- Auth: `/api/auth/*`, `/api/superadmin/login`
- Core: `/api/companies`, `/api/users`, `/api/participants`, `/api/assignments`, `/api/notes`, `/api/incidents`
- Workforce: `/api/availability`, `/api/clock`
- Insights: `/api/insights/company`, `/api/insights/state-managers`, `/api/insights/participants`, `/api/insights/support-workers`
- Audit: `/api/logs?logType=...`
- Dev seed: `POST /api/setup/seed`

## Run Locally

1. Install dependencies:
   - `npm install`
2. Copy environment template:
   - `cp .env.example .env.local`
3. Set at least:
   - `MONGODB_URI=...`
   - `MONGO_DB_NAME=syntrix` (or your preferred database name)
   - `JWT_SECRET=your-secret`
4. Start development server:
   - `npm run dev`
5. Seed initial Mongo data (development only):
   - `POST http://localhost:3000/api/setup/seed`

## Notes

- Seeding route is blocked in production.
- Logs are written for key write actions and auth events.
- Superadmin can manage cross-company data by passing `companyId` where needed.
