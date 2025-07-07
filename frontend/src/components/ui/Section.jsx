import clsx from "clsx";

const variants = {
  default: "",
  soft: "bg-slate-50 dark:bg-slate-800/40",
  inverted: "bg-slate-800 text-white",
};

export default function Section({
  id,
  title,
  eyebrow,
  children,
  variant = "default",
  align = "center",
  snap = true,              
  fullScreen = true,       
  className = "",
}) {
  const titleAlign = align === "left" ? "text-left" : "text-center";
  const containerAlign = align === "left" ? "items-start" : "items-center";

  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={clsx(
        fullScreen && "h-screen flex flex-col justify-center",
        snap && "snap-start",
        "py-16 px-4",
        variants[variant],
        className
      )}
    >
      <div className="mx-auto max-w-6xl w-full flex flex-col gap-6">
        {(eyebrow || title) && (
          <div className={clsx("flex flex-col", containerAlign)}>
            {eyebrow && (
              <span className={clsx("text-sm font-medium text-indigo-600 uppercase tracking-wide", titleAlign)}>
                {eyebrow}
              </span>
            )}
            {title && (
              <h2
                id={id ? `${id}-title` : undefined}
                className={clsx("text-3xl font-semibold text-slate-800 dark:text-slate-100 mt-2", titleAlign)}
              >
                {title}
              </h2>
            )}
          </div>
        )}
        <div>{children}</div>
      </div>
    </section>
  );
}
