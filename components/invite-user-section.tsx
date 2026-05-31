"use client";

import { useState } from "react";
import { useUserRole } from "@/contexts/user-role-context";
import { ALL_ROLES, ROLE_LABELS, type UserRole } from "@/lib/roles";
import { inviteUser } from "@/app/actions/invite-user";
import SectionCard from "@/components/section-card";

export default function InviteUserSection() {
  const { role: myRole, loading } = useUserRole();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("zoologist");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string; link?: string } | null>(null);

  if (loading || myRole !== "admin") return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);

    const res = await inviteUser(email.trim(), role, name.trim());

    if (res.error) {
      setResult({ type: "error", text: res.error });
    } else {
      setResult({ type: "success", text: res.success!, link: res.link ?? undefined });
      setEmail("");
      setName("");
      setRole("zoologist");
    }

    setSending(false);
  }

  return (
    <SectionCard title="Пригласить сотрудника" eyebrow="Новый пользователь">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="сотрудник@example.com"
              required
              className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#1f4d3a]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Имя (необязательно)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Асылбеков Аман"
              className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#1f4d3a]"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Роль</label>
          <div className="flex flex-wrap gap-3">
            {ALL_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                  role === r
                    ? "bg-[#1f4d3a] text-white"
                    : "bg-white text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-2xl bg-[#f8faf7] px-4 py-3 text-sm text-[#6b7280]">
            {role === "admin" && "Полный доступ ко всем разделам"}
            {role === "zoologist" && "Поголовье, партии, взвешивания, вакцины"}
            {role === "accountant" && "Корма, расходы, продажи, аналитика"}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={sending || !email}
            className="rounded-2xl bg-[#1f4d3a] px-6 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {sending ? "Отправка..." : "Отправить приглашение"}
          </button>

          {result && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                result.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {result.text}
            </div>
          )}
        </div>
      </form>

      {result?.link && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-2 text-sm font-medium text-emerald-800">
            Скопируй ссылку и отправь сотруднику в WhatsApp / Telegram / на почту:
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={result.link}
              className="flex-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs text-[#374151] outline-none"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={() => navigator.clipboard.writeText(result.link!)}
              className="shrink-0 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-medium text-white hover:opacity-90"
            >
              Копировать
            </button>
          </div>
          <p className="mt-2 text-xs text-emerald-700">Ссылка одноразовая — сотрудник установит пароль и сразу войдёт.</p>
        </div>
      )}

      <div className="mt-5 rounded-2xl bg-[#f8faf7] p-4 text-sm text-[#6b7280]">
        <p className="font-medium text-[#374151]">Как это работает</p>
        <p className="mt-1">Нажми кнопку → получишь ссылку → отправь сотруднику в мессенджер. Он перейдёт, установит пароль и сразу войдёт с нужной ролью.</p>
      </div>
    </SectionCard>
  );
}
