export default function AuthLayout({ children }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-6 py-10 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_24%),linear-gradient(180deg,_#070b14_0%,_#0b1120_100%)]" />
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <section className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-100">
              SBMS access
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Secure access for the operations workspace.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-8 text-slate-300 sm:text-lg">
              Sign in to reach the protected dashboard. Admins can also manage employee onboarding from the same session.
            </p>
          </section>

          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}