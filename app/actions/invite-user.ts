"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { ALL_ROLES, ROLE_LABELS, type UserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase-server";

export async function inviteUser(email: string, role: UserRole, name: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Войдите в систему, чтобы пригласить сотрудника" };
  }

  const { data: profile, error: roleError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (roleError || profile?.role !== "admin") {
    return { error: "Приглашать сотрудников может только директор" };
  }

  if (typeof email !== "string" || !email.trim() || !ALL_ROLES.includes(role)) {
    return { error: "Укажите email и допустимую роль" };
  }
  if (typeof name !== "string") {
    return { error: "Имя должно быть текстом" };
  }
  email = email.trim();
  name = name.trim();

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY не задан на сервере" };
  }

  const adminSupabase = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Генерируем ссылку напрямую (без email — без лимитов)
  const { data, error } = await adminSupabase.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      redirectTo: "https://agro-dashboard-roan.vercel.app/auth/callback",
      data: { name },
    },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      return { error: "Пользователь с таким email уже существует" };
    }
    return { error: error.message };
  }

  if (!data.user || !data.properties?.action_link) {
    return { error: "Сервис не вернул ссылку приглашения" };
  }

  const { error: profileError } = await adminSupabase.from("user_profiles").upsert({
    id: data.user.id,
    email,
    name: name || null,
    role,
  });
  if (profileError) {
    return { error: "Не удалось сохранить профиль приглашённого сотрудника" };
  }

  return {
    success: `Ссылка создана · Роль: ${ROLE_LABELS[role]}`,
    link: data.properties.action_link,
  };
}
