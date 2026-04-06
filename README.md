# Syntrix

Syntrix is a multi-tenant NDIS operations management prototype built with Next.js App Router.

It supports:
- Public landing page and company registration
- JWT cookie auth with role-aware routing
- Superadmin workspace for platform-wide company oversight
- Company workspace for staff, participants, assignments, notes, and incidents
- Backend email architecture with reusable templates/services
- Data source switching between dummy JSON repositories and MongoDB repositories

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

The app follows a layered backend design:

- **API routes** call controllers only
- **Controllers** orchestrate request/response concerns
- **Services** contain business logic
- **Repositories** handle data access
- **Config** handles DB/auth/mailer/data source
- **Dummy JSON** lives in `src/data`
- **Mongo models/repositories** live in `src/backend/models` and `src/backend/repositories/mongo`

This allows the same services/controllers to work with either data source.

## Data Source Switching

Switching is centralized in `src/backend/config/dataSource.js` and `src/backend/repositories/index.js`.

Rule:
- If `MONGODB_URI` exists and is not empty -> use Mongo repositories
- If `MONGODB_URI` is empty -> use dummy repositories backed by JSON files in `src/data`

No service/controller code changes are needed when switching.

## Multi-Tenancy

- All company-owned entities include `companyId`
- Company queries are filtered by `companyId`
- API guards enforce role and company scoping
- Middleware protects routes and redirects by role

## Demo Credentials (Dummy Mode)

All demo accounts use password: `Password123!`

- **Superadmin**: `superadmin@syntrix.com`
- **Company Admin (Care Horizons)**: `sarah@carehorizons.com`
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
  data/
middleware.js
```

## Run Locally

1. Install dependencies:
   - `npm install`
2. Copy environment template:
   - `cp .env.example .env.local`
3. Set at least:
   - `JWT_SECRET=your-secret`
4. Start development server:
   - `npm run dev`

## Enable MongoDB Later

When ready:
1. Set `MONGODB_URI` in `.env.local`
2. Restart server

Syntrix will automatically switch from dummy JSON repositories to MongoDB repositories.
