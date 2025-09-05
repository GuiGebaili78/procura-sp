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
      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
      : "";
    const variantClasses = variant === "filled" ? "bg-gray-50" : "bg-white";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-primary mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${variantClasses} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
