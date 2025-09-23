import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  variant?: "spinner" | "dots" | "pulse" | "skeleton";
}

export function Loading({ 
  size = "md", 
  className = "", 
  text, 
  variant = "spinner" 
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const renderLoading = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-1">
            <div className={`${sizeClasses[size]} bg-accent rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`${sizeClasses[size]} bg-accent rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`${sizeClasses[size]} bg-accent rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      case "pulse":
        return (
          <div className={`${sizeClasses[size]} bg-accent rounded-full animate-pulse`}></div>
        );
      
      case "skeleton":
        return (
          <div className="animate-pulse">
            <div className={`${sizeClasses[size]} bg-gray-300 rounded`}></div>
          </div>
        );
      
      default:
        return <div className={`spinner ${sizeClasses[size]} flex-shrink-0`}></div>;
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderLoading()}
      {text && (
        <span className={`ml-3 text-dark-primary ${textSizeClasses[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
}
