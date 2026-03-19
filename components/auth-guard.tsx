"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      const isLoginPage = pathname === "/login";

      if (!session && !isLoginPage) {
        setAuthorized(false);
        setLoading(false);
        router.replace("/login");
        return;
      }

      if (session && isLoginPage) {
        setAuthorized(true);
        setLoading(false);
        router.replace("/");
        return;
      }

      setAuthorized(!!session || isLoginPage);
      setLoading(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      const isLoginPage = pathname === "/login";

      if (!session && !isLoginPage) {
        setAuthorized(false);
        router.replace("/login");
        return;
      }

      if (session && isLoginPage) {
        setAuthorized(true);
        router.replace("/");
        return;
      }

      setAuthorized(!!session || isLoginPage);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8f4]">
        <div className="rounded-2xl bg-white px-6 py-4 text-sm text-[#6b7280] shadow-sm ring-1 ring-[#e6ebdf]">
          Загрузка...
        </div>
      </div>
    );
  }

  if (!authorized && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}