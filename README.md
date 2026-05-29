# Ticketing System

A simple ticketing system to help me organize contacts for possible future clients.

## Tech Stack

- Svelte/SvelteKit
- TypeScript
- Postgres
- Drizzle

## Getting Started

1. Clone the project
2. Run `bun run db:start` to start the postgres docker container.
3. Run `bun run db:push` to run the migrations on the database.
4. Create the admin account with `bun run seed:admin <email> <password> <name>` with your email, password, and name replacing the values shown above. Make sure you don't include the angle-brackets.
5. Run `bun run dev` or `bun dev` to run the development server.

## Features

- Admin dashboard to monitor tickets
- API to create and read tickets externally
- Calendar to manage bookings and meetings

