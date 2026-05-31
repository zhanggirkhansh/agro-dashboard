"use server";

import { createClient } from "@supabase/supabase-js";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function inviteUser(email: string, role: UserRole, name: string) {
  if (!email || !role) {
    return { error: "Email и роль обязательны" };
  }

  // Отправляем приглашение через Supabase Auth
  const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
    data: { name },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      return { error: "Пользователь с таким email уже существует" };
    }
    return { error: error.message };
  }

  // Создаём профиль с нужной ролью
  if (data.user) {
    await adminSupabase.from("user_profiles").upsert({
      id: data.user.id,
      email,
      name: name || null,
      role,
    });
  }

  return { success: `Приглашение отправлено на ${email} · Роль: ${ROLE_LABELS[role]}` };
}
