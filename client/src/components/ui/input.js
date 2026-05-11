import { forwardRef } from "react";
import { cn } from "./button";

const Input = forwardRef(function Input(
  { className, label, hint, error, id, containerClassName, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  const helperId = inputId ? `${inputId}-helper` : undefined;
  const errorId = inputId ? `${inputId}-error` : undefined;

  return (
    <label className={cn("grid gap-2", containerClassName)} htmlFor={inputId}>
      {label ? <span className="text-sm font-medium text-slate-200">{label}</span> : null}
      <input
        ref={ref}
        id={inputId}
        aria-describedby={error ? errorId : hint ? helperId : undefined}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white shadow-inner shadow-slate-950/30 outline-none transition placeholder:text-slate-500 focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/15",
          error && "border-rose-400/50 focus:border-rose-300/60 focus:ring-rose-300/15",
          className,
        )}
        {...props}
      />
      {hint ? (
        <p id={helperId} className="text-xs leading-5 text-slate-400">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs leading-5 text-rose-300">
          {error}
        </p>
      ) : null}
    </label>
  );
});

export { Input };