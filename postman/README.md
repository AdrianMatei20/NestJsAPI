# Postman Collection

This folder contains a Postman collection covering every REST endpoint in the app, with both success and failure scenarios (validation errors, auth/role failures, not-found cases).

GraphQL endpoints are not included here — use the built-in GraphQL Playground at `/graphql` for those.

## Setup

1. Import `NestJsAPI.postman_collection.json` into Postman.
2. Open the collection, go to its **Variables** tab, and fill in the "Current value" column for `adminEmail` / `adminPassword` / `defaultEmail` / `defaultPassword` with the seeded credentials from your local `.env` (`ADMIN_USER_EMAIL`, `DEFAULT_USER_EMAIL`, `DEFAULT_PASSWORD`). **Never commit real values into these fields** — they ship blank on purpose. Everything else the collection needs (base URL, seeded test emails, throwaway ids) is already filled in as collection variables, so no separate environment is required.
3. Start the app (`npm run start:dev`, or via `docker-compose up`), then run requests against `{{baseUrl}}` (defaults to `http://localhost:3001`, also editable in the Variables tab).

## Auth model: session cookies

This API uses session-cookie auth (`express-session` + Passport), not bearer tokens. Run one of the **Auth > Login** requests first — Postman's cookie jar automatically stores the `SESSION_ID` cookie and attaches it to subsequent requests against the same `baseUrl`.

Requests named `... - 401 not logged in` explicitly disable auth for that single request (`noauth` override), so they correctly exercise the unauthenticated path even if you're logged in from a previous request.

Switching between "as admin" and "as regular user" scenarios means re-running the corresponding **Login** request first, since logging in as a different user overwrites the session cookie.

## Seeded test data (deterministic)

`SeedService` assigns `@test.com` users to projects using a fixed `memberIndices` list per project in `test-data/projects.json`, so the same users end up owning/editing the same projects on every fresh seed — not random each time. This collection relies on that determinism for role-based scenarios that a freshly-created, empty project can't exercise on its own (a project you create via this collection only ever has one member: you, the owner):

- `testOwnerEmail` (`jamessmith@test.com`) is always the **OWNER** of the seeded **"Project Phoenix"** project.
- `testEditorEmail` (`patriciaperez@test.com`) is always an **EDITOR** (not owner) on that same project.
- `testDeletableUserEmail` (`sharoncollins@test.com`) is a seeded user not involved in Project Phoenix, used for the **Delete user** demo so it doesn't disturb the pairing above.

These are hardcoded, safe-to-commit collection variables — they're derived from the committed, non-secret `src/services/seed/test-data/users.json` / `projects.json`, so they're identical for anyone who clones the repo and seeds a fresh database. Only the shared password for these accounts (`DEFAULT_PASSWORD`, used for every seeded user including admin/default) is machine-specific, which is why `defaultPassword` (like `adminEmail`/`adminPassword`/`defaultEmail`) ships blank instead of committed.

Run **Auth > Login > "Login - success (seeded project editor)"** then **Project > "Resolve seeded project id (Project Phoenix)"** before the "insufficient project role" 403 requests — the resolver looks up the project by name and stores its (DB-generated, non-deterministic) id as `seededProjectId`.

## Other requests that need manual values

A few flows involve values that only exist outside the API response (e.g. sent via email, or requiring a fresh, non-duplicate email per run):

- **Register**: change `newUserEmail` between runs, or you'll hit the "already registered" (409) case instead of "success".
- **Verify user** / **Reset password (via emailed link)**: `verifyToken` / `resetToken` are emailed to the user (or, in local dev without a real email provider configured, logged to the console/log table). Copy the token from there into the collection variable before running these.

## Chaining

- "Create project - success (admin)" automatically sets the `projectId` collection variable from its response, so the ad-hoc CRUD lifecycle in the **Project** folder (get/update/delete your own freshly-created project) can chain off it. That folder is ordered so its "delete" success case runs last — running requests out of order (e.g. delete, then get) will correctly 403/404 for anything after the delete.
- "Resolve seeded project id (Project Phoenix)" and "Resolve seeded user id (Sharon Collins)" similarly set `seededProjectId` / `userId` for the seeded-data scenarios described above.
