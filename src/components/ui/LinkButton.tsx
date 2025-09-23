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
      "bg-accent hover:bg-accent/90 text-white focus:ring-accent/50",
    secondary:
      "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
    outline:
      "border-2 border-accent text-accent hover:bg-accent hover:text-white focus:ring-accent/50",
    ghost: "text-accent hover:bg-accent/10 focus:ring-accent/50",
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
