// components/Button.jsx
import Link from "next/link";
import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

/**
 * Palette:
 *  #6172A3 – primary (slate-blue)
 *  #D4E1F2 – muted light (powder-blue)
 *  #F2E3D5 – neutral (soft beige)
 *  #C8DCD6 – secondary (sea-foam)
 *  #739794 – accent (dusty teal)
 */

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition",
  {
    variants: {
      variant: {
        primary:
          "bg-[#6172A3] text-white hover:bg-[#546597] focus-visible:ring-[#6172A3]",
        secondary:
          "bg-[#C8DCD6] text-[#171717] hover:bg-[#b8ccc6] focus-visible:ring-[#C8DCD6]",
        outline:
          "border border-[#6172A3] text-[#6172A3] bg-white hover:bg-[#D4E1F2] focus-visible:ring-[#6172A3]",
        ghost:
          "text-[#6172A3] hover:bg-[#F2E3D5] focus-visible:ring-[#6172A3]",
        link:
          "underline underline-offset-4 text-[#6172A3] hover:text-[#739794] focus-visible:ring-[#6172A3]",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
      },
      full: {
        true: "w-full",
        false: "",
      },
      disabled: {
        true: "opacity-40 pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const Button = forwardRef(function Button(
  {
    href,
    as: ComponentOverride,
    variant,
    size,
    full = false,
    disabled = false,
    className,
    children,
    ...rest
  },
  ref
) {
  const Component = ComponentOverride || (href ? Link : "button");
  const styles = buttonStyles({ variant, size, full, disabled });
  const mergedClassName = twMerge(styles, className);

  const sharedProps = {
    className: mergedClassName,
    ref,
    ...rest,
  };

  // If href is passed, render a <Link>; otherwise a <button>
  if (href) {
    return (
      <Component href={href} {...sharedProps}>
        {children}
      </Component>
    );
  }

  return (
    <button disabled={disabled} {...sharedProps}>
      {children}
    </button>
  );
});

export default Button;
