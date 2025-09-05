import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-secondary hover:bg-secondary-hover text-white focus:ring-info shadow-sm hover:shadow-md",
    secondary:
      "bg-primary hover:bg-primary-light text-white focus:ring-primary shadow-sm hover:shadow-md",
    outline:
      "border-2 border-secondary text-secondary hover:bg-secondary hover:text-white focus:ring-info",
    ghost: "text-secondary hover:bg-surface-accent focus:ring-info",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-base rounded-lg",
    lg: "px-6 py-3 text-lg rounded-xl",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && <div className="spinner w-4 h-4 mr-2 flex-shrink-0"></div>}
      {children}
    </button>
  );
}
