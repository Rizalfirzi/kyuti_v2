import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "diproses" | "siap" | "disiapkan" | "diantar" | "selesai" | "diterima" | "warning" | "success";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-[#FFE8F0] text-[#E92D79] border border-pink-200/60",
    diproses: "bg-[#FFF8E7] text-[#D97706] border border-[#FDE68A]",
    siap: "bg-[#EDFDF2] text-[#15803D] border border-[#BBF7D0]",
    disiapkan: "bg-[#FFF0F5] text-[#E92D79] border border-[#FBCFE8]",
    diantar: "bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]",
    selesai: "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]",
    diterima: "bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

