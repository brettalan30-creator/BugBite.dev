// Production server for the built site. The TanStack Start build emits a portable
// fetch handler (dist/server/server.js) plus static client assets (dist/client);
// this wraps them in a Bun server on port 3000 — static files first, SSR for the
// rest. Run `bun run build` before starting. Restart it with `bun run publish`.
//
// Starting a new instance supersedes the old one: it frees the port no matter
// which user owns the current server (provisioning starts it as `engine`; a team
// member's `bun run publish` runs as their own user), so publish never collides
// with an already-running server. Every sandbox user has passwordless sudo, so
// the takeover works across user boundaries.
import handler from "./dist/server/server.js";
import { neon } from "@neondatabase/serverless";

// Pinned, NOT read from the environment. The published preview URL
// (<label>.<PUBLIC_SITE_DOMAIN>) is reverse-proxied to 0.0.0.0:3000 inside the
// sandbox, so the default site MUST bind there. Bun auto-loads .env files, so
// honouring process.env.PORT/HOST would let a stray env var or a .env in the site
// dir silently move the site off :3000 (or onto loopback) and break the public URL.
const PORT = 3000;
const HOST = "0.0.0.0";
const CLIENT_DIR = `${import.meta.dir}/dist/client`;

// Free PORT regardless of which user owns the current listener. lsof runs under
// sudo so it can see (and the kill can signal) a process owned by another user;
// the loop waits for the socket to actually release before we bind.
const freePort =
  `for _ in $(seq 1 25); do ` +
  `pids=$(lsof -t -iTCP:${String(PORT)} -sTCP:LISTEN 2>/dev/null || true); ` +
  `if [ -z "$pids" ]; then exit 0; fi; ` +
  `kill $pids 2>/dev/null || true; sleep 0.2; ` +
  `done`;

// --- DB helper ---
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

// --- Session helpers ---
const SECRET = process.env.SESSION_SECRET || "bugbite-mvp-secret-change-in-prod";

async function hmac(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getSessionUserId(req: Request): Promise<string | null> {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies: Record<string, string> = {};
    for (const part of cookieHeader.split(";")) {
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      cookies[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
    }
    const session = cookies["bugbite_session"];
    if (!session) return null;
    const dot = session.indexOf(".");
    if (dot === -1) return null;
    const userId = session.slice(0, dot);
    const sig = session.slice(dot + 1);
    if (await hmac(userId) !== sig) return null;
    const rows = await getSql()`SELECT id FROM users WHERE id = ${userId}`;
    if (rows.length === 0) return null;
    return userId;
  } catch { return null; }
}

function serializeCookie(c: { name: string; value: string; httpOnly?: boolean; sameSite?: string; path?: string; maxAge?: number }): string {
  const parts = [`${c.name}=${c.value}`];
  if (c.httpOnly) parts.push("HttpOnly");
  if (c.sameSite) parts.push(`SameSite=${c.sameSite}`);
  if (c.path) parts.push(`Path=${c.path}`);
  if (c.maxAge !== undefined) parts.push(`Max-Age=${c.maxAge}`);
  return parts.join("; ");
}

function json(data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

// --- API handler ---
async function handleApi(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  if (method === "OPTIONS" && path === "/api/reports") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // POST /api/auth/register
  if (method === "POST" && path === "/api/auth/register") {
    try {
      const { username, password } = await req.json();
      if (!username || !password) return json({ error: "username and password required" }, 400);
      const existing = await getSql()`SELECT id FROM users WHERE username = ${username}`;
      if (existing.length > 0) return json({ error: "username already taken" }, 409);
      const hash = await Bun.password.hash(password);
      const rows = await getSql()`INSERT INTO users (username, password_hash) VALUES (${username}, ${hash}) RETURNING id, username`;
      const cookie = {
        name: "bugbite_session",
        value: `${rows[0].id}.${await hmac(rows[0].id)}`,
        httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
      };
      return json({ user: { id: rows[0].id, username: rows[0].username } }, 201, { "Set-Cookie": serializeCookie(cookie) });
    } catch (err) { console.error("register:", err); return json({ error: "internal server error" }, 500); }
  }

  // POST /api/auth/login
  if (method === "POST" && path === "/api/auth/login") {
    try {
      const { username, password } = await req.json();
      if (!username || !password) return json({ error: "username and password required" }, 400);
      const rows = await getSql()`SELECT id, username, password_hash FROM users WHERE username = ${username}`;
      if (rows.length === 0) return json({ error: "invalid username or password" }, 401);
      const valid = await Bun.password.verify(password, rows[0].password_hash);
      if (!valid) return json({ error: "invalid username or password" }, 401);
      const cookie = {
        name: "bugbite_session",
        value: `${rows[0].id}.${await hmac(rows[0].id)}`,
        httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
      };
      return json({ user: { id: rows[0].id, username: rows[0].username } }, 200, { "Set-Cookie": serializeCookie(cookie) });
    } catch (err) { console.error("login:", err); return json({ error: "internal server error" }, 500); }
  }

  // GET /api/auth/me
  if (method === "GET" && path === "/api/auth/me") {
    try {
      const userId = await getSessionUserId(req);
      if (!userId) return json({ error: "not authenticated" }, 401);
      const rows = await getSql()`SELECT id, username FROM users WHERE id = ${userId}`;
      if (rows.length === 0) return json({ error: "user not found" }, 401);
      return json({ user: { id: rows[0].id, username: rows[0].username } });
    } catch (err) { console.error("me:", err); return json({ error: "internal server error" }, 500); }
  }

  // POST /api/auth/logout
  if (method === "POST" && path === "/api/auth/logout") {
    return json({ ok: true }, 200, { "Set-Cookie": serializeCookie({ name: "bugbite_session", value: "", httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 }) });
  }

  // GET /api/projects
  if (method === "GET" && path === "/api/projects") {
    try {
      const userId = await getSessionUserId(req);
      if (!userId) return json({ error: "not authenticated" }, 401);
      const rows = await getSql()`SELECT id, name, created_at FROM projects WHERE user_id = ${userId} ORDER BY created_at DESC`;
      return json({ projects: rows.map((r: any) => ({ ...r, created_at: String(r.created_at) })) });
    } catch (err) { console.error("projects:", err); return json({ error: "internal server error" }, 500); }
  }

  // POST /api/projects
  if (method === "POST" && path === "/api/projects") {
    try {
      const userId = await getSessionUserId(req);
      if (!userId) return json({ error: "not authenticated" }, 401);
      const { name } = await req.json();
      if (!name || typeof name !== "string" || !name.trim()) return json({ error: "name is required" }, 400);
      const rows = await getSql()`INSERT INTO projects (user_id, name) VALUES (${userId}, ${name.trim()}) RETURNING id, name, created_at`;
      return json({ project: { id: rows[0].id, name: rows[0].name, created_at: String(rows[0].created_at) } }, 201);
    } catch (err) { console.error("create project:", err); return json({ error: "internal server error" }, 500); }
  }

  // GET /api/reports?project_id=X
  if (method === "GET" && path === "/api/reports") {
    try {
      const userId = await getSessionUserId(req);
      if (!userId) return json({ error: "not authenticated" }, 401);
      const projectId = url.searchParams.get("project_id");
      if (!projectId) return json({ error: "project_id is required" }, 400);
      const proj = await getSql()`SELECT id FROM projects WHERE id = ${projectId} AND user_id = ${userId}`;
      if (proj.length === 0) return json({ error: "project not found" }, 404);
      const rows = await getSql()`SELECT id, project_id, description, screenshot, browser_info, status, reporter_email, dev_note, created_at FROM reports WHERE project_id = ${projectId} ORDER BY created_at DESC`;
      return json({ reports: rows.map((r: any) => ({ ...r, created_at: String(r.created_at) })) });
    } catch (err) { console.error("reports:", err); return json({ error: "internal server error" }, 500); }
  }

  // POST /api/reports — PUBLIC
  if (method === "POST" && path === "/api/reports") {
    try {
      const body = await req.json();
      const { project_id, description, screenshot, browser_info, reporter_email } = body;
      if (!project_id) return json({ error: "project_id is required" }, 400, corsHeaders());
      const proj = await getSql()`SELECT id FROM projects WHERE id = ${project_id}`;
      if (proj.length === 0) return json({ error: "project not found" }, 404, corsHeaders());
      const rows = await getSql()`INSERT INTO reports (project_id, description, screenshot, browser_info, reporter_email) VALUES (${project_id}, ${description || ""}, ${screenshot || null}, ${JSON.stringify(browser_info || {})}, ${reporter_email || null}) RETURNING id, status`;
      return json({ id: rows[0].id, status: rows[0].status }, 201, corsHeaders());
    } catch (err) { console.error("create report:", err); return json({ error: "internal server error" }, 500, corsHeaders()); }
  }

  // PATCH /api/reports/:id
  const patchMatch = path.match(/^\/api\/reports\/([a-f0-9-]+)$/);
  if (method === "PATCH" && patchMatch) {
    try {
      const userId = await getSessionUserId(req);
      if (!userId) return json({ error: "not authenticated" }, 401);
      const reportId = patchMatch[1];
      const rep = await getSql()`SELECT r.id, r.status, r.dev_note FROM reports r JOIN projects p ON r.project_id = p.id WHERE r.id = ${reportId} AND p.user_id = ${userId}`;
      if (rep.length === 0) return json({ error: "report not found" }, 404);
      const body = await req.json();
      const { status, dev_note } = body;
      if (status && status !== "open" && status !== "closed") return json({ error: "status must be 'open' or 'closed'" }, 400);
      const newStatus = status || rep[0].status;
      const newNote = dev_note !== undefined ? dev_note : rep[0].dev_note;
      const updated = await getSql()`UPDATE reports SET status = ${newStatus}, dev_note = ${newNote} WHERE id = ${reportId} RETURNING id, status, dev_note`;
      return json({ report: { id: updated[0].id, status: updated[0].status, dev_note: updated[0].dev_note } });
    } catch (err) { console.error("patch report:", err); return json({ error: "internal server error" }, 500); }
  }

  return null;
}

// Take over the port, re-freeing and retrying if another publish grabbed it in the
// gap between freeing and binding (last publish wins). Bun.serve throws EADDRINUSE
// synchronously, so without this a raced publish would die while the shell already
// reported success.
for (let attempt = 1; ; attempt++) {
  await Bun.$`sudo sh -c ${freePort}`.quiet().nothrow();
  try {
    Bun.serve({
      port: PORT,
      hostname: HOST,
      async fetch(req) {
        const { pathname } = new URL(req.url);

        // API routes
        if (pathname.startsWith("/api/")) {
          const apiResp = await handleApi(req);
          if (apiResp) return apiResp;
        }

        // Static files
        if (pathname !== "/") {
          const file = Bun.file(CLIENT_DIR + pathname);
          if (await file.exists()) return new Response(file);
        }

        // SSR handler
        return (
          handler as { fetch: (r: Request) => Response | Promise<Response> }
        ).fetch(req);
      },
    });
    break;
  } catch (err) {
    if (attempt >= 10) throw err;
    await Bun.sleep(200);
  }
}

console.log(`team-site serving on http://${HOST}:${String(PORT)}`);
