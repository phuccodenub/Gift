"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "size" | "children">,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled"> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(125deg,#8f1c48,#b42c5f_52%,#d88aa1)] text-white shadow-[0_20px_45px_-24px_rgba(63,20,44,0.72)] hover:shadow-[0_24px_52px_-24px_rgba(63,20,44,0.88)]",
  secondary:
    "border border-[rgba(96,61,77,0.24)] text-[var(--app-text)] bg-[rgba(255,251,248,0.7)] backdrop-blur-md hover:bg-[rgba(255,251,248,0.95)]",
  ghost: "text-[var(--app-brand)] hover:bg-[rgba(180,44,95,0.08)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-[12px] gap-1.5",
  md: "px-6 py-3 text-base rounded-[14px] gap-2",
  lg: "px-8 py-4 text-lg rounded-[18px] gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { y: -2 }}
        whileTap={isDisabled ? undefined : { y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        disabled={isDisabled}
        className={cn(
          "relative inline-flex min-h-11 min-w-11 items-center justify-center font-semibold font-[family-name:var(--font-body)] transition-colors duration-200 cursor-pointer select-none",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          isDisabled && "opacity-55 cursor-not-allowed",
          className,
        )}
        {...rest}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

export default Button;
