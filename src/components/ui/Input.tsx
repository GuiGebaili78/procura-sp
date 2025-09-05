import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "filled";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, variant = "default", className = "", ...props },
    ref,
  ) => {
    const baseClasses = "input-base w-full";
    const errorClasses = error
      ? "border-error focus:border-error focus:ring-error-light"
      : "";
    const variantClasses = variant === "filled" ? "bg-surface-secondary" : "bg-surface";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-primary mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${variantClasses} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-secondary">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
