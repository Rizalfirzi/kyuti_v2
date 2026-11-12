import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ className, icon, ...props }: InputProps) {
  if (icon) {
    return (
      <div className="relative w-full">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
        <input
          className={cn(
            "w-full pl-11 pr-5 py-2.5 bg-white border border-gray-200/90 rounded-full text-xs font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E92D79]/20 focus:border-[#E92D79] transition shadow-xs",
            className
          )}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      className={cn(
        "w-full px-4 py-2.5 bg-white border border-gray-200/90 rounded-xl text-xs font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E92D79]/20 focus:border-[#E92D79] transition shadow-xs",
        className
      )}
      {...props}
    />
  );
}

