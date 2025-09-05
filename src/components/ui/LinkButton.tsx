import React from "react";
import Link from "next/link";

interface LinkButtonProps {
  href: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg";

  const variantClasses = {
    primary:
      "bg-secondary hover:bg-secondary-hover text-white focus:ring-info",
    secondary:
      "bg-primary hover:bg-primary-light text-white focus:ring-primary",
    outline:
      "border-2 border-secondary text-secondary hover:bg-secondary hover:text-white focus:ring-info",
    ghost: "text-secondary hover:bg-surface-accent focus:ring-info",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-base rounded-lg",
    lg: "px-6 py-3 text-lg rounded-xl",
  };

  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
