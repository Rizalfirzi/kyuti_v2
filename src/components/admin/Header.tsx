'use client';

import React from 'react';
import { Menu, Bell, ChevronDown, RefreshCw, Sparkles } from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export function AdminHeader({ onToggleMobileSidebar, onRefresh, loading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-pink-100/80 bg-white/90 backdrop-blur-md px-4 lg:px-8 py-3.5 shadow-xs">
      <div className="flex h-11 items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-gray-600 hover:text-[#E92D79] hover:bg-[#FFF5F8] rounded-xl transition"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm md:text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
              <span>Panel Manajemen</span>
              <span className="hidden sm:inline text-xs text-[#E92D79] bg-[#FFE8F0] px-2 py-0.5 rounded-full font-bold">
                Kedai Kyuti ♡
              </span>
            </h2>
          </div>
        </div>

        {/* Right: Actions (Refresh, Bell, Admin User) */}
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              title="Refresh Data"
              className="p-2 text-gray-500 hover:text-[#E92D79] hover:bg-[#FFE8F0] rounded-xl transition cursor-pointer border-0 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E92D79]' : ''}`} />
            </button>
          )}

          {/* Notification Bell with Badge */}
          <div className="relative p-2 text-gray-600 hover:text-[#E92D79] hover:bg-[#FFE8F0] rounded-xl transition cursor-pointer">
            <Bell className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#E92D79] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
              3
            </span>
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-gray-50 hover:bg-[#FFE8F0] rounded-full border border-gray-200/60 transition cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
              alt="Admin"
              className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-300"
            />
            <span className="text-xs font-bold text-gray-800">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 stroke-[2]" />
          </div>
        </div>
      </div>
    </header>
  );
}

