import { cn } from "./button";

function Card({ className, children, ...props }) {
  return (
    <section
      className={cn(
        "rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

function CardHeader({ className, children, ...props }) {
  return (
    <header className={cn("mb-5 flex flex-col gap-2", className)} {...props}>
      {children}
    </header>
  );
}

function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-lg font-semibold tracking-tight text-white", className)} {...props}>
      {children}
    </h3>
  );
}

function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-sm leading-7 text-slate-300", className)} {...props}>
      {children}
    </p>
  );
}

function CardBody({ className, children, ...props }) {
  return (
    <div className={cn("grid gap-4", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }) {
  return (
    <footer className={cn("mt-6 flex flex-wrap items-center gap-3", className)} {...props}>
      {children}
    </footer>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter };