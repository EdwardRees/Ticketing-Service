# Ticketing System

A simple ticketing system to help me organize contacts for possible future clients.

## Tech Stack

- Svelte/SvelteKit
- TypeScript
- Postgres
- Drizzle

## Getting Started

1. Clone the project.
2. Run `openssl rand -base64 32` to generate the JWT secret and update the `.env` to include this under the `JWT_SECRET` environment secret.
3. Run `bun run db:start` to start the postgres docker container.
4. Run `bun run db:push` to run the migrations on the database.
5. Create the admin account with `bun run seed:admin <email> <password> <name>` with your email, password, and name replacing the values shown above. Make sure you don't include the angle-brackets.
6. Run `bun run dev` or `bun dev` to run the development server.

## Features

- Admin dashboard to monitor tickets
- API to create and read tickets externally
- Calendar to manage bookings and meetings
- Tickets track the name, description, type of ticket (mobile development, web development, tutoring, system design, and other), the contact name, contact email, and notes to track updates on the ticket.
- The types of tickets model the main kinds of tickets I may need to keep track of.
        - Changing the ticket types would require updating the `lib/server/db/schema.ts`, `routes/api/v1/tickets/+server.ts`, `routes/+page.svelte`, `routes/tickets/[id]/+page.svelte`, `routes/tickets/+page.svelte`, `routes/tickets/new/+page.svelte`, and `routes/tickets/new/+page.server.ts`.

