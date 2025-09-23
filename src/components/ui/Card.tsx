import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  children,
  className = "",
  variant = "default",
  padding = "md",
  hover = true,
  ...props
}: CardProps) {
  const baseClasses =
    "bg-white rounded-xl border border-gray-200 transition-shadow";

  const variantClasses = {
    default: "shadow-lg",
    elevated: "shadow-xl",
    outlined: "shadow-sm border-2",
  };

  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const hoverClasses = hover ? "hover:shadow-xl" : "";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
