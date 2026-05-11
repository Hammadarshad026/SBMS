import Link from "next/link";

const moduleCards = [
  {
    title: "Auth-first shell",
    description:
      "Session persistence, JWT bootstrapping, and protected navigation are prepared for the next phase.",
  },
  {
    title: "API-ready foundation",
    description:
      "The client API layer already mirrors the backend resources for auth, employees, tasks, attendance, and financials.",
  },
  {
    title: "Responsive system UI",
    description:
      "The root layout and global styles now establish a polished, dark, responsive visual system for the app.",
  },
];

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-sky-950/20 backdrop-blur-xl sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-100">
              SBMS frontend phase 1
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              A clean frontend architecture for operations, people, and finance.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              This client is wired to the backend contract and prepared for auth flows, guarded routes,
              and resource-rich dashboards without collapsing into a monolith.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full bg-sky-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-200"
              >
                Sign in
              </Link>
              <a
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Admin onboarding
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Connected endpoints</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-200">
                <EndpointRow method="POST" path="/auth/login" label="Login session" />
                <EndpointRow method="GET" path="/auth/me" label="Current user" />
                <EndpointRow method="GET" path="/employees" label="Employee directory" />
                <EndpointRow method="GET" path="/tasks" label="Task board" />
                <EndpointRow method="GET" path="/attendance" label="Attendance logs" />
                <EndpointRow method="GET" path="/financials/summary" label="Financial summary" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <MetricCard value="JWT" label="session model" />
              <MetricCard value="4" label="core modules" />
              <MetricCard value="100%" label="responsive shell" />
            </div>
          </div>
        </section>

        <section id="architecture" className="grid gap-4 md:grid-cols-3">
          {moduleCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <h2 className="text-lg font-semibold text-white">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{card.description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function EndpointRow({ method, path, label }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="font-mono text-xs text-slate-400">{path}</p>
      </div>
      <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">
        {method}
      </span>
    </div>
  );
}

function MetricCard({ value, label }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-5 backdrop-blur-xl">
      <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}
