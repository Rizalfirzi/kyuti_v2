import React from "react";
import { cn } from "@/lib/utils";

interface GradientCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: "pink" | "orange" | "green" | "purple";
  className?: string;
}

export function GradientCard({
  title,
  value,
  subtitle,
  icon,
  variant = "pink",
  className,
}: GradientCardProps) {
  const variantStyles = {
    pink: "from-[#FF4E9B] to-[#E92D79] shadow-pink-200/50",
    orange: "from-[#F59E0B] to-[#D97706] shadow-amber-200/50",
    green: "from-[#10B981] to-[#059669] shadow-emerald-200/50",
    purple: "from-[#8B5CF6] to-[#7C3AED] shadow-purple-200/50",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br shadow-md transition-all hover:scale-[1.02]",
        variantStyles[variant],
        className
      )}
    >
      {/* Subtle background circles like DropX */}
      <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-white/85 tracking-wide uppercase">{title}</p>
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs text-white">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black tracking-tight">{value}</h3>
          {subtitle && <p className="mt-0.5 text-[11px] font-medium text-white/80">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

