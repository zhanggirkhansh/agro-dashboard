"use client";

import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-2xl bg-white/10 px-4 py-3 text-left text-white/80 transition hover:bg-white/15"
    >
      Выйти
    </button>
  );
}