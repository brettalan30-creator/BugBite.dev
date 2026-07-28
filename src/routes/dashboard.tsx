import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface User {
  id: string;
  username: string;
}

interface Project {
  id: string;
  name: string;
  created_at: string;
}

interface BrowserInfo {
  userAgent?: string;
  viewport?: string;
  platform?: string;
  language?: string;
  url?: string;
}

interface Report {
  id: string;
  project_id: string;
  description: string;
  screenshot: string | null;
  browser_info: BrowserInfo | string;
  status: "open" | "closed";
  reporter_email: string | null;
  dev_note: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function BugIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2l1.88 1.88" /><path d="M14.12 3.88L16 2" /><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" /><path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" /><path d="M6 13H2" /><path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" /><path d="M22 13h-4" /><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

function browserSummary(info: unknown): string {
  // The API may return browser_info as a JSON string or a parsed object
  let parsed: Record<string, unknown> = {};
  if (typeof info === "string") {
    try { parsed = JSON.parse(info); } catch { return "Unknown"; }
  } else if (info && typeof info === "object") {
    parsed = info as Record<string, unknown>;
  }
  const parts: string[] = [];
  if (typeof parsed.platform === "string" && parsed.platform) parts.push(parsed.platform);
  if (typeof parsed.viewport === "string" && parsed.viewport) parts.push(parsed.viewport);
  return parts.join(" · ") || "Unknown";
}

/* ------------------------------------------------------------------ */
/*  Dashboard Page                                                     */
/* ------------------------------------------------------------------ */

function DashboardPage() {
  const navigate = useNavigate();

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Create project
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  // Reports
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Error
  const [error, setError] = useState("");

  /* ---- Auth check ---- */
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          navigate({ to: "/login" });
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setAuthLoading(false);
      })
      .catch(() => navigate({ to: "/login" }));
  }, [navigate]);

  /* ---- Fetch projects ---- */
  useEffect(() => {
    if (!user) return;
    setProjectsLoading(true);
    fetch("/api/projects", { credentials: "include" })
      .then(async (res) => {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.projects && data.projects.length > 0) {
          setSelectedProjectId(data.projects[0].id);
        }
      })
      .catch(() => setError("Failed to load projects."))
      .finally(() => setProjectsLoading(false));
  }, [user]);

  /* ---- Fetch reports when project selected ---- */
  useEffect(() => {
    if (!selectedProjectId) return;
    setReportsLoading(true);
    setReports([]);
    fetch(`/api/reports?project_id=${encodeURIComponent(selectedProjectId)}`, {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        setReports(data.reports || []);
      })
      .catch(() => setError("Failed to load reports."))
      .finally(() => setReportsLoading(false));
  }, [selectedProjectId]);

  /* ---- Create project ---- */
  const handleCreateProject = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newProjectName.trim()) return;
      setCreatingProject(true);
      setError("");
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: newProjectName.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to create project.");
          return;
        }
        setProjects((prev) => [data.project, ...prev]);
        setSelectedProjectId(data.project.id);
        setNewProjectName("");
        setShowCreateProject(false);
      } catch {
        setError("Network error.");
      } finally {
        setCreatingProject(false);
      }
    },
    [newProjectName],
  );

  /* ---- Toggle report status ---- */
  const toggleStatus = useCallback(
    async (reportId: string, currentStatus: "open" | "closed") => {
      const newStatus = currentStatus === "open" ? "closed" : "open";
      // Optimistic update
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)),
      );
      try {
        const res = await fetch(`/api/reports/${reportId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          // Revert
          setReports((prev) =>
            prev.map((r) => (r.id === reportId ? { ...r, status: currentStatus } : r)),
          );
        }
      } catch {
        // Revert
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: currentStatus } : r)),
        );
      }
    },
    [],
  );

  /* ---- Logout ---- */
  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    navigate({ to: "/" });
  }, [navigate]);

  /* ---- Derived stats ---- */
  const totalReports = reports.length;
  const openReports = reports.filter((r) => r.status === "open").length;
  const closedReports = reports.filter((r) => r.status === "closed").length;

  /* ---- Loading state ---- */
  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  /* ---- Not authenticated ---- */
  if (!user) return null;

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <a href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <BugIcon />
            BugBite
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.username}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Upgrade banner */}
        <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm font-medium text-indigo-800">
            You're on the <span className="font-semibold">Free</span> plan.{" "}
            <span className="text-indigo-600">Upgrade to Pro for unlimited reports.</span>
          </p>
          <a
            href="https://buy.stripe.com/aFaeVf0HL9K3a7q68K0Ba00"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Upgrade to Pro
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button onClick={() => setError("")} className="ml-3 underline hover:no-underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Project selector + Create */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <FolderIcon />
            {projectsLoading ? (
              <span className="text-sm text-gray-400">Loading projects...</span>
            ) : projects.length === 0 ? (
              <span className="text-sm text-gray-500">No projects yet</span>
            ) : (
              <div className="relative">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-8 py-2 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon />
                {/* Inline style for the chevron position */}
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCreateProject(!showCreateProject)}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <PlusIcon />
            New Project
          </button>
        </div>

        {/* Create project form */}
        {showCreateProject && (
          <form
            onSubmit={handleCreateProject}
            className="mb-8 flex items-end gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4"
          >
            <div className="flex-1">
              <label htmlFor="new-project-name" className="block text-sm font-medium text-gray-700 mb-1">
                Project name
              </label>
              <input
                id="new-project-name"
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Web App"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={creatingProject || !newProjectName.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creatingProject ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateProject(false)}
              className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Stats */}
        {selectedProjectId && (
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{totalReports}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 shadow-sm ring-1 ring-amber-200">
              <p className="text-xs font-medium text-amber-600 uppercase">Open</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{openReports}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 shadow-sm ring-1 ring-emerald-200">
              <p className="text-xs font-medium text-emerald-600 uppercase">Closed</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{closedReports}</p>
            </div>
          </div>
        )}

        {/* Reports */}
        {selectedProjectId ? (
          reportsLoading ? (
            <div className="flex items-center gap-3 py-12 text-gray-400 justify-center">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Loading reports...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardIcon />
              <div className="mt-2 h-5 w-5 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No reports yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add the BugBite widget to your site to start collecting bug reports.
              </p>
              <p className="mt-4 text-xs text-gray-400 font-mono bg-gray-100 rounded-lg px-3 py-2">
                &lt;script src=&quot;https://bugbite.dev/widget.js&quot; data-project=&quot;{selectedProjectId}&quot;&gt;&lt;/script&gt;
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Status + Description */}
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            report.status === "open"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              report.status === "open" ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          />
                          {report.status === "open" ? "Open" : "Closed"}
                        </span>
                        {report.reporter_email && (
                          <span className="text-xs text-gray-400">{report.reporter_email}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap line-clamp-3">
                        {report.description || "No description provided."}
                      </p>

                      {/* Meta */}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <MonitorIcon />
                          {browserSummary(report.browser_info)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon />
                          {formatDate(report.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Screenshot thumbnail */}
                    {report.screenshot && (
                      <div className="hidden sm:block shrink-0">
                        <img
                          src={report.screenshot}
                          alt="Bug screenshot"
                          className="h-20 w-32 rounded-lg object-cover ring-1 ring-gray-200"
                        />
                      </div>
                    )}

                    {/* Toggle button */}
                    <button
                      onClick={() => toggleStatus(report.id, report.status)}
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        report.status === "open"
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      }`}
                    >
                      {report.status === "open" ? "Close" : "Reopen"}
                    </button>
                  </div>

                  {/* Screenshot thumbnail (mobile) */}
                  {report.screenshot && (
                    <div className="mt-3 sm:hidden">
                      <img
                        src={report.screenshot}
                        alt="Bug screenshot"
                        className="w-full h-40 rounded-lg object-cover ring-1 ring-gray-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : projects.length === 0 && !projectsLoading ? (
          /* No projects at all — already handled by "No projects yet" */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderIcon />
            <div className="mt-2 h-5 w-5 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No projects yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first project to start collecting bug reports.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
