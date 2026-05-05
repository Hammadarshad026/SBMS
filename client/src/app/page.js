import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="flex w-full max-w-4xl flex-col items-center gap-8 text-center">
        <span className="rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          SBMS Platform
        </span>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Small Business Management, Unified
          </h1>
          <p className="text-base text-slate-600 sm:text-lg">
            Track employees, tasks, attendance, and financials in one place with
            secure, role-based access.
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
            href="/login"
          >
            Sign in
          </Link>
          <Link
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
            href="/dashboard"
          >
            Go to dashboard
          </Link>
        </div>
        <div className="grid w-full gap-4 text-left sm:grid-cols-3">
          {[
            {
              title: "People Ops",
              description: "Manage employees, roles, and performance snapshots.",
            },
            {
              title: "Daily Operations",
              description:
                "Track attendance, check-ins, and task status with clarity.",
            },
            {
              title: "Financial Health",
              description:
                "Monitor sales, expenses, and summaries for quick decisions.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
