import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function Loading({ size = "md", className = "", text }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`spinner ${sizeClasses[size]} flex-shrink-0`}></div>
      {text && (
        <span className={`ml-3 text-dark-primary ${textSizeClasses[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
}