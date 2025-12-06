# accelerate-career-coach


A modern Next.js application scaffolded with Tailwind CSS, Prisma, Clerk authentication, and integrations for generative AI and background jobs (Inngest). It includes ready-made pages for onboarding, dashboard, AI-powered cover letter and resume helpers, and a Prisma schema with migrations.

## Key Features
- Next.js 15 application with Turbopack-enabled dev/build scripts
- Tailwind CSS UI components and Radix primitives under `components/` and `app/`
- Authentication via Clerk (`@clerk/nextjs`)
- Prisma ORM for database modeling and migrations (`prisma/`)
- Google Generative AI client integration (`@google/generative-ai`)
- Background & serverless job support via `inngest`

## Quick Start

Prerequisites
- Node.js 18+ (recommended)
- A supported database (Postgres, MySQL, etc.) for Prisma

1. Install dependencies

```powershell
cd my-app
npm install
```

2. Create a `.env` file at the repository root and set required environment variables. Common keys used by this project:

- `DATABASE_URL` — your Prisma database connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET` — Clerk credentials
- `GOOGLE_API_KEY` or set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON path for Google Generative AI
- `INNGEST_API_KEY` — if using Inngest cloud features

Add any additional secrets your deployment needs. The project expects `prisma/schema.prisma` to match your `DATABASE_URL`.

3. Prepare Prisma (generate client and run migrations)

```powershell
npx prisma generate
# If you are developing locally and want to apply migrations:
npx prisma migrate dev
```

4. Run the development server

```powershell
npm run dev
# Open http://localhost:3000
```

Build for production

```powershell
npm run build
npm run start
```

Helpful scripts (from `package.json`)

- `npm run dev` — Start Next.js in development (Turbopack)
- `npm run build` — Build the production app
- `npm run start` — Run the built app
- `npm run lint` — Run ESLint

## Project Layout (high level)

- `app/` — Next.js App Router pages and components
- `components/` — Shared UI components and primitives
- `prisma/` — Prisma schema and migrations
- `lib/` — helpers, Prisma client wrapper, utilities
- `actions/` — server-side actions (resume, cover-letter, interview, user)
- `public/` — static assets

Inspect these folders for examples of implementing features and integrations.

## Environment & Integrations

- Authentication: Clerk — configure your Clerk application and set the publishable+secret keys in the `.env` file.
- Database: Prisma — set `DATABASE_URL` and run migrations. The generated Prisma client is available under `lib/generated/prisma`.
- Generative AI: The project uses `@google/generative-ai`; configure Google Cloud credentials with `GOOGLE_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS`.
- Background Jobs: `inngest` is included for event-driven workflows. Set `INNGEST_API_KEY` to use hosted features.

## Usage Examples

- Create and preview cover letters from `app/(main)/ai-cover-letter/_components/`.
- The dashboard and resume tools live under `app/(main)/dashboard` and `app/(main)/resume` respectively.

Run a quick smoke test locally:

```powershell
npm run dev
# visit http://localhost:3000 and sign up / sign in
```
