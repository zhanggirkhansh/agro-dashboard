"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/lib/roles";

type UserRoleContextValue = {
  role: UserRole | null;
  email: string | null;
  loading: boolean;
  refetch: () => void;
};

const UserRoleContext = createContext<UserRoleContextValue>({
  role: null,
  email: null,
  loading: true,
  refetch: () => {},
});

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setRole(null);
      setEmail(null);
      setLoading(false);
      return;
    }

    setEmail(user.email ?? null);

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setRole((profile?.role as UserRole) ?? "zoologist");
    setLoading(false);
  }

  useEffect(() => {
    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserRoleContext.Provider value={{ role, email, loading, refetch: load }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}
