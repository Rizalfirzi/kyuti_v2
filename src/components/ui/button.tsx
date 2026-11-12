import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "pink" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses = {
    default: "bg-[#E92D79] hover:bg-[#D81B60] text-white shadow-md shadow-pink-300/40 border-0",
    pink: "bg-[#FFE8F0] hover:bg-[#FFDEEB] text-[#E92D79] border-0 font-bold",
    outline: "border border-pink-200 bg-white hover:bg-[#FFF5F8] text-gray-700 hover:text-[#E92D79]",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border-0",
    ghost: "bg-transparent hover:bg-[#FFE8F0] text-gray-600 hover:text-[#E92D79] border-0",
    destructive: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60",
  };

  const sizeClasses = {
    default: "h-9 px-4 py-2 text-xs font-bold rounded-xl",
    sm: "h-8 px-3 text-xs font-semibold rounded-lg",
    lg: "h-11 px-6 text-sm font-bold rounded-2xl",
    icon: "h-9 w-9 p-0 flex items-center justify-center rounded-xl",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition cursor-pointer active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}

