<p align="center">
  <h1 align="center">🐛 BugBite</h1>
  <p align="center">
    <strong>Lightweight bug reporting for web apps. One line of JS, and your users can report bugs with screenshots.</strong>
  </p>
</p>

<p align="center">
  <a href="https://github.com/brettalan30-creator/BugBite.dev/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/built%20with-Bun-f9f1e1?logo=bun" alt="Built with Bun">
  <img src="https://img.shields.io/badge/built%20with-React%2019-61dafb?logo=react" alt="Built with React">
  <img src="https://img.shields.io/badge/built%20with-Tailwind%20CSS-06b6d4?logo=tailwindcss" alt="Built with Tailwind CSS">
  <img src="https://img.shields.io/badge/built%20with-Neon%20Postgres-00e5ff?logo=postgresql" alt="Built with Neon Postgres">
</p>

---

## What is BugBite?

BugBite is a drop-in bug reporting widget for web apps. Add one `<script>` tag to your site and your users get a floating "Report a Bug" button. They can capture a screenshot, annotate the issue, and submit it — the report lands in your dashboard where you can triage, update, and close it. No bloat, no complex setup. Just ship it and start collecting feedback.

## Quick Start

**3 steps to start collecting bug reports:**

1. **[Sign up](https://c6d692d14ba375f0f70c87013e5143ae.ctonew.app)** for a free BugBite account
2. **Create a project** in your dashboard — you'll get a project ID
3. **Paste the script tag** into your site's `<head>`:

```html
<script src="https://c6d692d14ba375f0f70c87013e5143ae.ctonew.app/widget.js"
        data-project="YOUR_PROJECT_ID"></script>
```

That's it. A floating "Report a Bug" button appears on your site. Your users click it, describe the issue, and submit — screenshot and all.

## Features

- **Floating report button** — unobtrusive, always accessible "Report a Bug" button that sits at the edge of the page
- **Automatic screenshots** — captures the full page via [html2canvas](https://html2canvas.hertzen.com/) with one click
- **CORS-enabled submission API** — reports are submitted cross-origin from any domain, no backend changes needed
- **Dashboard with status tracking** — view, filter, and manage all incoming reports in one place (open / closed)
- **Free tier** — 50 reports per project per month, no credit card required
- **Stripe payments for Pro** — upgrade to unlimited reports for $12/month

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Runtime        | [Bun](https://bun.sh)                               |
| Frontend       | [React 19](https://react.dev)                       |
| Framework      | [TanStack Start](https://tanstack.com/start)        |
| Styling        | [Tailwind CSS 4](https://tailwindcss.com)           |
| Database       | [Neon Postgres](https://neon.tech)                  |
| Screenshots    | [html2canvas](https://html2canvas.hertzen.com/)     |
| Payments       | [Stripe](https://stripe.com)                        |

## Project Structure

```
src/
├── routes/
│   ├── index.tsx          # Landing page
│   ├── login.tsx          # Login / register
│   ├── dashboard.tsx      # Report triage dashboard
│   └── thank-you.tsx      # Post-submission thank-you page
public/
├── widget.js              # The embeddable bug reporting widget
serve.ts                   # Production server + all API routes
migrate.ts                 # Database schema migration
```

## Getting Started (Development)

```bash
# Clone the repo
git clone https://github.com/brettalan30-creator/BugBite.dev.git
cd BugBite.dev

# Install dependencies
bun install

# Set your Neon Postgres connection string
export DATABASE_URL="postgresql://..."

# Run migrations to create the database tables
bun run migrate.ts

# Build and start the server on port 3000
bun run publish
```

The app will be running at `http://localhost:3000`.

## API Reference

| Method | Path                   | Auth Required | Description                          |
| ------ | ---------------------- | :-----------: | ------------------------------------ |
| POST   | `/api/auth/register`   | No            | Register a new user                  |
| POST   | `/api/auth/login`      | No            | Log in and receive a session cookie  |
| GET    | `/api/auth/me`         | Yes           | Get the currently authenticated user |
| POST   | `/api/auth/logout`     | No            | Clear the session                    |
| GET    | `/api/projects`        | Yes           | List all projects for the user       |
| POST   | `/api/projects`        | Yes           | Create a new project                 |
| GET    | `/api/reports`         | Yes           | List reports for a project           |
| POST   | `/api/reports`         | No (CORS)     | Submit a bug report from the widget  |
| PATCH  | `/api/reports/:id`     | Yes           | Update report status or dev note     |

## Pricing

| Plan   | Reports / month | Price           |
| ------ | --------------- | --------------- |
| Free   | 50              | $0              |
| Pro    | Unlimited       | $12 / month     |

**[Upgrade to Pro →](https://buy.stripe.com/aFaeVf0HL9K3a7q68K0Ba00)**

## License

MIT © BugBite
