import { cloneElement, forwardRef, isValidElement } from "react";

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

const buttonVariants = {
  primary:
    "bg-sky-300 text-slate-950 shadow-lg shadow-sky-950/20 hover:bg-sky-200 focus-visible:ring-sky-300",
  secondary:
    "border border-white/10 bg-white/5 text-white hover:bg-white/10 focus-visible:ring-white/30",
  ghost:
    "text-slate-200 hover:bg-white/5 hover:text-white focus-visible:ring-white/20",
  danger:
    "bg-rose-500 text-white shadow-lg shadow-rose-950/20 hover:bg-rose-400 focus-visible:ring-rose-300",
};

const buttonSizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const Button = forwardRef(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    type = "button",
    asChild = false,
    children,
    ...props
  },
  ref,
) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50",
    buttonVariants[variant] ?? buttonVariants.primary,
    buttonSizes[size] ?? buttonSizes.md,
    className,
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: cn(children.props.className, classes),
    });
  }

  return (
    <button ref={ref} type={type} className={classes} {...props}>
      {children}
    </button>
  );
});

export { Button, buttonVariants, buttonSizes, cn };