"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";
import MobileSidebar from "@/components/mobile-sidebar";
import AuthGuard from "@/components/auth-guard";

type Props = {
  children: React.ReactNode;
};

export default function AppShell({ children }: Props) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoginPage) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f5f7f2]">
        <MobileSidebar
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <div className="flex min-h-screen">
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e6ebdf] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl p-2 text-[#1f4d3a] hover:bg-[#f3f6ef]"
                aria-label="Открыть меню"
              >
                <Menu size={22} />
              </button>

              <div className="truncate text-sm font-semibold text-[#1f4d3a]">
                WestKaz Agro
              </div>

              <div className="w-9" />
            </header>

            <main className="flex-1 p-4 pb-6 sm:p-5 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}