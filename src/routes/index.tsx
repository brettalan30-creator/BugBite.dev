import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";

const getBusinessName = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
      businessName?: string;
    };
    return cfg.businessName?.trim() ?? "";
  } catch {
    return "";
  }
});

export const Route = createFileRoute("/")({
  loader: () => getBusinessName(),
  component: Home,
});

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */

function EmbedIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  );
}

function CaptureIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function TriageIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-green-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function BugIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2l1.88 1.88" />
      <path d="M14.12 3.88L16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Section components                                                 */
/* ------------------------------------------------------------------ */

function Header({ businessName }: { businessName: string }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <BugIcon />
          {businessName || "BugBite"}
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 sm:flex">
          <a href="#how-it-works" className="transition-colors hover:text-gray-900">
            How It Works
          </a>
          <a href="#pricing" className="transition-colors hover:text-gray-900">
            Pricing
          </a>
          <a href="#snippet" className="transition-colors hover:text-gray-900">
            Docs
          </a>
          <a href="/dashboard" className="transition-colors hover:text-gray-900">
            Dashboard
          </a>
          <a
            href="/login"
            className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            Login
          </a>
          <a
            href="#pricing"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            Get Started
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-[600px] w-[600px] rounded-full bg-indigo-50 opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 h-[400px] w-[400px] rounded-full bg-amber-50 opacity-40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          Now in public beta
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
          Bug Reports That
          <br />
          <span className="text-indigo-600">Actually Help</span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
          Add a one-line snippet to your web app and let your users report bugs with
          screenshots, annotations, and context — straight to your dashboard. No more
          "it's broken" emails.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="/login?register=true"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-amber-200 transition-all hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-300 active:scale-[0.98]"
          >
            Get Started Free
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            See how it works
          </a>
        </div>

        {/* Trust indicator */}
        <p className="mt-8 text-sm text-gray-400">
          No credit card required · 50 reports/month (limit enforced)
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: <EmbedIcon />,
      title: "Embed",
      description:
        "Paste a single line of JavaScript into your app. That's it — no SDK, no build step, no configuration wizard.",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      number: "2",
      icon: <CaptureIcon />,
      title: "Capture",
      description:
        "Your users click 'Report a Bug', get a screenshot of the page, annotate the problem, and submit — all in seconds.",
      color: "bg-amber-50 text-amber-600",
    },
    {
      number: "3",
      icon: <TriageIcon />,
      title: "Triage",
      description:
        "Reports land in your dashboard with screenshots, browser info, and user notes. Triage, resolve, and ship fixes faster.",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <section id="how-it-works" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            From bug to fix in three steps
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            No complicated setup. No bloated SDKs. Just a widget that works.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
            >
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${step.color}`}
              >
                {step.icon}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                  {step.number}
                </span>
                <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
              </div>
              <p className="mt-4 leading-relaxed text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for side projects and solo developers testing the waters.",
      features: [
        { text: "50 reports per month (strictly enforced)", highlight: true },
        "Single project",
        "Basic dashboard",
        "Screenshot capture",
        "Email notifications",
      ],
      cta: "Start for free",
      popular: false,
    },
    {
      name: "Pro",
      price: "$12",
      period: "per month",
      description: "For teams that ship fast and need unlimited feedback channels.",
      features: [
        "Unlimited reports",
        "Unlimited projects",
        "Advanced dashboard with filters",
        "Screenshot + annotation tools",
        "Priority support",
        "Custom branding (remove BugBite logo)",
        "Slack & Discord integrations",
      ],
      cta: "Get started",
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 shadow-sm ring-1 ${
                plan.popular
                  ? "scale-[1.02] ring-2 ring-indigo-600 shadow-xl shadow-indigo-100"
                  : "ring-gray-200"
              } bg-white`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold tracking-tight text-gray-900">
                  {plan.price}
                </span>
                <span className="ml-2 text-gray-500">/{plan.period}</span>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => {
                  const text = typeof feature === "string" ? feature : feature.text;
                  const highlight = typeof feature === "object" && feature.highlight;
                  return (
                    <li key={text} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckIcon />
                      <span className={highlight ? "font-bold text-amber-600" : ""}>
                        {text}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <a
                href={plan.popular
                  ? "https://buy.stripe.com/aFaeVf0HL9K3a7q68K0Ba00"
                  : "/login?register=true"
                }
                className={`block rounded-xl px-6 py-3 text-center text-sm font-semibold transition-all active:scale-[0.98] ${
                  plan.popular
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SnippetDocs() {
  const embedCode =
    '<script src="https://bugbite.dev/widget.js" data-project="YOUR_PROJECT_ID"></script>';

  return (
    <section id="snippet" className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            One line. That's all it takes.
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Drop this snippet into your app's <code className="rounded bg-gray-800 px-1.5 py-0.5 text-sm text-indigo-300">&lt;head&gt;</code> and
            your users can start reporting bugs immediately. No SDK, no build tools, no fuss.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          {/* Code block */}
          <div className="group relative rounded-xl border border-gray-700 bg-gray-950 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs text-gray-500">index.html</span>
            </div>
            <pre className="overflow-x-auto">
              <code className="text-sm text-gray-300">{embedCode}</code>
            </pre>
          </div>

          {/* Setup steps */}
          <div className="mt-10 space-y-4">
            <div className="flex items-start gap-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                1
              </span>
              <div>
                <p className="font-medium text-white">Get your project ID</p>
                <p className="mt-1 text-sm text-gray-400">
                  Sign up and create a project. You'll get a unique project ID to use in the snippet.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                2
              </span>
              <div>
                <p className="font-medium text-white">Paste the snippet</p>
                <p className="mt-1 text-sm text-gray-400">
                  Add the script tag to your web app — just before the closing{" "}
                  <code className="rounded bg-gray-700 px-1 text-gray-300">&lt;/head&gt;</code> or{" "}
                  <code className="rounded bg-gray-700 px-1 text-gray-300">&lt;/body&gt;</code> tag.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                3
              </span>
              <div>
                <p className="font-medium text-white">You're live</p>
                <p className="mt-1 text-sm text-gray-400">
                  A floating "Report a Bug" button appears on your site. Users can submit reports
                  immediately — they'll show up in your BugBite dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ businessName }: { businessName: string }) {
  return (
    <footer className="border-t border-gray-100 bg-white py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between">
        <a href="#" className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <BugIcon />
          {businessName || "BugBite"}
        </a>
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {businessName || "BugBite"}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

function Home() {
  const businessName = Route.useLoaderData();

  return (
    <div className="min-h-dvh bg-white">
      <Header businessName={businessName} />
      <Hero />
      <HowItWorks />
      <Pricing />
      <SnippetDocs />
      <Footer businessName={businessName} />
    </div>
  );
}
