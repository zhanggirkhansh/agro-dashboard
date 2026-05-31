"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import LogoutButton from "@/components/logout-button";
import { useUserRole } from "@/contexts/user-role-context";
import { getMenuForRole, ROLE_LABELS } from "@/lib/roles";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MobileSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { role, email } = useUserRole();
  const menuItems = getMenuForRole(role);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside className="absolute left-0 top-0 h-full w-[88%] max-w-[320px] bg-[#1f4d3a] text-white shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-5 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-2xl bg-white p-1 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="WestKaz Agro"
                  width={40}
                  height={40}
                  className="rounded-xl object-cover"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs uppercase tracking-[0.2em] text-white/70">
                  WestKaz Agro
                </p>
                <h1 className="truncate text-lg font-semibold">
                  Agro Dashboard
                </h1>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-white/80 hover:bg-white/10"
              aria-label="Закрыть меню"
            >
              <X size={20} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                      isActive
                        ? "bg-white text-[#1f4d3a] font-semibold"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-white/70">Статус хозяйства</p>
                <p className="mt-2 text-lg font-semibold">
                  Откорм в активной фазе
                </p>
                <p className="mt-1 text-sm text-white/70">WestKaz Agro</p>
              </div>

              {(email || role) && (
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="truncate text-sm font-medium">{email}</p>
                  {role && (
                    <p className="mt-0.5 text-xs text-white/60">{ROLE_LABELS[role]}</p>
                  )}
                </div>
              )}

              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
