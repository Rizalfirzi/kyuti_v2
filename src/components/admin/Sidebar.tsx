'use client';

import React from 'react';
import {
  LayoutDashboard,
  Package,
  PlusSquare,
  FileBarChart,
  Settings,
  LogOut,
  ExternalLink,
  X,
  Heart,
} from 'lucide-react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  openCreateModal: () => void;
  handleLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  ordersCount: number;
}

export function AdminSidebar({
  activeMenu,
  setActiveMenu,
  openCreateModal,
  handleLogout,
  mobileOpen,
  setMobileOpen,
  ordersCount,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pesanan', icon: Package, badge: ordersCount },
    { id: 'reports', label: 'Laporan', icon: FileBarChart },
    { id: 'settings', label: 'Pengaturan & Fee', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container (dropx-admin layout) */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-white border-r border-pink-100 flex flex-col justify-between p-5 z-50 transition-transform duration-200 shadow-sm md:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-pink-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFE8F0] border border-pink-200 flex items-center justify-center text-xl shadow-xs">
                ☕
              </div>
              <div>
                <h1 className="font-extrabold text-gray-900 text-base tracking-tight flex items-center gap-1.5">
                  Kedai Kyuti <span className="text-[#E92D79] text-sm">♡</span>
                </h1>
                <p className="text-[10px] text-gray-400 font-medium">Jasdor Kopi Kenangan</p>
              </div>
            </div>
            {mobileOpen && (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 mt-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveMenu(item.id);
                    setMobileOpen(false);
                  }}
                  className={`relative w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-[#FFE8F0] text-[#E92D79]'
                      : 'text-gray-700 hover:text-[#E92D79] hover:bg-[#FFF5F8]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-1.5 bg-[#E92D79] rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E92D79]' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isActive
                          ? 'bg-white text-[#E92D79] shadow-xs'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Action: Tambah Pesanan Modal */}
            <button
              type="button"
              onClick={() => {
                openCreateModal();
                setMobileOpen(false);
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-gray-700 hover:text-[#E92D79] hover:bg-[#FFF5F8] transition-all text-left"
            >
              <PlusSquare className="w-4 h-4 text-gray-500" />
              <span>Tambah Pesanan</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section: Store Link & Logout */}
        <div className="pt-6 border-t border-pink-50 relative">
          {/* Subtle floating heart decoration */}
          <div className="absolute right-2 bottom-14 pointer-events-none opacity-30">
            <Heart className="w-5 h-5 text-[#E92D79] stroke-[1.5]" />
          </div>

          <div className="space-y-1">
            <a
              href="/"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-[#E92D79] hover:bg-pink-50/50 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Lihat Website Toko</span>
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-red-600 hover:bg-red-50/50 transition text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

