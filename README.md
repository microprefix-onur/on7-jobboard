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

## My decisions

In the first place the form validation with superforms and zod. It combines the client and server side validation and superforms works great with zod.

The ui system was plain input and textareas, I decided to change the overall look to be minimal but also accessable with shadcn library.

I planed the whole project together with claude code and the matt popock skills (which is very helpful and simple to use, nice suggestion by the way). So in every part of this work are decisions of me.

## What the AI could do better

Honestly the AI did a very good work. I think a big help was the skill base of matt popock. In combination the task could be split in tickets and sub tickets, so that there was not one huge prompt but a step by step implementation of features.

If I did it without these skills there could be problems like inconsistency and loops of misunderstandings.

## Future Features

First of all the design should be better. The design updates with shadcn are not implemented in this version, they are already added to the github tickets. I wanted to focus on features more than looks in the first place.

Beneath that I would implement the mail logic for sending automatic mails to the applicant and the recruiter so that no updates are lost or checked too late.

Teams would be a feature which is needed, if the recruiter just makes the job listings but wants to pass it to the person who can really check the cv and application.

Another improvement would be a direct invitation with teams or google meet link added, so that there can be a processing state for the applicant with applied, reviewed, call initialized, approved.

AI can also be integrated. The applicant can upload his cv and the AI decides which job listings are best fit. Also for first job interview with chat or if it should be advanced with a video agent.
