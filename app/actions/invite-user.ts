"use server";

import { createClient } from "@supabase/supabase-js";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";

export async function inviteUser(email: string, role: UserRole, name: string) {
  if (!email || !role) {
    return { error: "Email и роль обязательны" };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY не задан на сервере" };
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Генерируем ссылку напрямую (без email — без лимитов)
  const { data, error } = await adminSupabase.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      redirectTo: "https://agro-dashboard-roan.vercel.app",
      data: { name },
    },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      return { error: "Пользователь с таким email уже существует" };
    }
    return { error: error.message };
  }

  if (data.user) {
    await adminSupabase.from("user_profiles").upsert({
      id: data.user.id,
      email,
      name: name || null,
      role,
    });
  }

  return {
    success: `Ссылка создана · Роль: ${ROLE_LABELS[role]}`,
    link: data.properties?.action_link ?? null,
  };
}
