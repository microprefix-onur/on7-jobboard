# on7 Jobboard

A minimal job board. Recruiters log in, publish job postings and review the applications to them. Applicants browse open job postings and apply without an account. The UI is in German.

Built with SvelteKit 3 (Svelte 5), PostgreSQL, Drizzle ORM, better-auth, Superforms and Zod.

## Quick start with Docker

```sh
docker compose up --build
```

This starts three services, in order:

1. `postgres`: the database (port 5432).
2. `migrate`: applies the committed migrations in `drizzle/`, then exits.
3. `app`: the application at <http://localhost:3000>.

Then load the demo data (in a second terminal):

```sh
docker compose exec app node scripts/seed.js
```

Log in at <http://localhost:3000/login> with:

| Email              | Password   |
| ------------------ | ---------- |
| `demo@example.com` | `demo1234` |

The demo recruiter has two open job postings and one closed job posting, with applications in every application status. Running the seed again does nothing and says so.

Compose uses a development-only session secret. Set `BETTER_AUTH_SECRET` in your environment for anything beyond local use.

## Local development

Requirements: Node.js 22.17 or newer, pnpm 12, Docker (for Postgres).

```sh
pnpm install
cp .env.example .env               # then set BETTER_AUTH_SECRET, e.g. openssl rand -base64 32
docker compose up -d postgres
pnpm db:migrate
pnpm db:seed                       # optional demo data, same as above
pnpm dev                           # http://localhost:5173
```

## Tests

```sh
docker compose up -d postgres
pnpm test
```

The tests are integration tests against a real Postgres. They use the `jobboard_test` database on the Compose Postgres, or `TEST_DATABASE_URL` if set. Each run drops and recreates that database, applies the committed migrations, and empties the tables before every test. Your development data is never touched.

The tests call the domain module (`src/lib/server/job-board.ts`) directly. They cover the server-side rules:

- no applications to closed job postings;
- one application per email address per job posting, also for differently written emails and simultaneous applications;
- input validation;
- recruiters only ever see and change their own job postings and applications.

Other checks:

```sh
pnpm lint      # Prettier and ESLint
pnpm check     # svelte-check (types)
pnpm format    # fix formatting
```

## Database migrations

Migrations are generated with drizzle-kit and committed to `drizzle/`.

1. Change the schema in `src/lib/server/db/schema.ts`.
2. Generate a migration: `pnpm db:generate --name <short-description>`.
3. Review the SQL and commit it with the schema change.

`pnpm db:migrate` applies the migrations locally. In Docker, the `migrate` service does it before the app starts. The better-auth tables in `src/lib/server/db/auth.schema.ts` are generated with `pnpm auth:schema`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push:

- **Lint and typecheck**: `pnpm lint` and `pnpm check`.
- **Integration tests**: `pnpm test` against a Postgres service container.
- **Docker image build**: builds the production image.

## How it fits together

- `src/lib/server/job-board.ts` is the domain module. Every business rule lives here. It validates input with the shared Zod schemas and returns typed results (`success`, `invalid`, `not-found`, `posting-closed`, `already-applied`) instead of throwing. Ownership is part of each query, so another recruiter's data behaves as if it didn't exist.
- `src/lib/schemas/` holds the Zod schemas that both the forms (Superforms) and the domain module use.
- `src/routes/` holds thin SvelteKit routes. They authenticate, call the domain module and map its results to pages, form errors or 404s.
- `src/hooks.server.ts` loads the better-auth session and guards everything under `/recruiter`, including form actions.

The domain vocabulary is defined in [`GLOSSARY.md`](GLOSSARY.md), including the German UI word for each term.

## Not included

Emails of any kind, teams or organisations, rate limiting, file uploads, search and pagination are out of scope. The domain module is the single place to add them later.
