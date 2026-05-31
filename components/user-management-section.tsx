"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUserRole } from "@/contexts/user-role-context";
import { ALL_ROLES, ROLE_LABELS, type UserRole } from "@/lib/roles";
import { useToast } from "@/components/toast-provider";
import SectionCard from "@/components/section-card";

type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
};

export default function UserManagementSection() {
  const { role: myRole, loading } = useUserRole();
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  async function fetchProfiles() {
    const { data } = await supabase
      .from("user_profiles")
      .select("id, email, name, role")
      .order("email");
    setProfiles(data ?? []);
  }

  useEffect(() => {
    if (myRole === "admin") fetchProfiles();
  }, [myRole]);

  async function handleRoleChange(profileId: string, newRole: UserRole) {
    setSaving(profileId);
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole })
      .eq("id", profileId);

    if (error) {
      showToast("Ошибка", "Не удалось изменить роль", "warning");
    } else {
      showToast("Роль обновлена", ROLE_LABELS[newRole], "success");
      fetchProfiles();
    }
    setSaving(null);
  }

  if (loading) return null;
  if (myRole !== "admin") return null;

  return (
    <SectionCard title="Управление пользователями" eyebrow="Доступ и роли">
      {profiles.length === 0 ? (
        <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
          Пользователи не найдены.
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-2xl border border-[#ebf0e6] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{p.email ?? "—"}</p>
                {p.name && <p className="text-sm text-[#6b7280]">{p.name}</p>}
              </div>

              <select
                value={p.role}
                disabled={saving === p.id}
                onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                className="rounded-2xl border border-[#d9e2d2] bg-white px-4 py-2 text-sm outline-none disabled:opacity-60"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
