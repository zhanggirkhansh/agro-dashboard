"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Beef,
  Boxes,
  Wheat,
  Wallet,
  Scale,
  ShoppingCart,
  BarChart3,
  Settings,
} from "lucide-react";
import LogoutButton from "@/components/logout-button";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Поголовье", href: "/livestock", icon: Beef },
  { label: "Партии", href: "/batches", icon: Boxes },
  { label: "Корма", href: "/feed", icon: Wheat },
  { label: "Расходы", href: "/expenses", icon: Wallet },
  { label: "Взвешивания", href: "/weighings", icon: Scale },
  { label: "Продажи", href: "/sales", icon: ShoppingCart },
  { label: "Аналитика", href: "/analytics", icon: BarChart3 },
  { label: "Настройки", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [stats, setStats] = useState({
    animals: 0,
    batches: 0,
  });

  async function fetchStats() {
    const [{ data: livestock }, { data: batches }] = await Promise.all([
      supabase.from("livestock").select("id"),
      supabase.from("batches").select("id"),
    ]);

    setStats({
      animals: livestock?.length || 0,
      batches: batches?.length || 0,
    });
  }

  useEffect(() => {
    fetchStats();

    const livestockChannel = supabase
      .channel("sidebar-livestock")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "livestock" },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    const batchesChannel = supabase
      .channel("sidebar-batches")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "batches" },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(livestockChannel);
      supabase.removeChannel(batchesChannel);
    };
  }, []);

  const statusText =
    stats.animals > 0 ? "Откорм в активной фазе" : "Нет данных";

  return (
    <aside className="flex w-72 flex-col justify-between bg-[#1f4d3a] p-6 text-white">
      <div>
        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-2xl bg-white p-1 shadow-sm">
            <Image
              src="/logo.png"
              alt="WestKaz Agro"
              width={44}
              height={44}
              className="rounded-xl object-cover"
            />
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">
              WestKaz Agro
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Agro Dashboard</h1>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
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
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-sm text-white/70">Статус хозяйства</p>
          <p className="mt-2 text-lg font-semibold">{statusText}</p>
          <p className="mt-1 text-sm text-white/70">
            {stats.batches} партий · {stats.animals} голов
          </p>
        </div>

        <LogoutButton />
      </div>
    </aside>
  );
}