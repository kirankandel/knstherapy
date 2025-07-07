import clsx from "clsx";

const variants = {
  elevated: "shadow-md bg-white dark:bg-slate-900 dark:text-slate-100",
  bordered: "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
  subtle: "bg-slate-50 dark:bg-slate-800",
  glass: "bg-white/60 backdrop-blur-md shadow-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800/50",
};

export default function Card({
  children,
  className = "",
  variant = "elevated",
  as = "div",
  ...rest
}) {
  const Tag = as;
  return (
    <Tag
      className={clsx(
        "rounded-xl p-6 transition-shadow duration-300",
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
