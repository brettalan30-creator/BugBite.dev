// Run this once to create the database tables:
//   bun run migrate.ts

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);

async function migrate() {
  console.log("Running migrations...");

  // Enable uuid-ossp extension
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // Users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  console.log("  ✓ users table");

  // Projects table
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  console.log("  ✓ projects table");

  // Reports table
  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      description TEXT NOT NULL DEFAULT '',
      screenshot TEXT,
      browser_info JSONB DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'open',
      reporter_email TEXT,
      dev_note TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  console.log("  ✓ reports table");

  console.log("Migration complete.");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
