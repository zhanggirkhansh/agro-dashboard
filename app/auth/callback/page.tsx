"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SectionCard from "@/components/section-card";
import PageHeader from "@/components/page-header";

type State = "loading" | "set-password" | "error";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      // Даём Supabase время подхватить токены из хэша
      await new Promise((r) => setTimeout(r, 800));

      // Пробуем получить сессию
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setState("error");
        return;
      }

      // Смотрим тип из хэша
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace("#", ""));
      const type = params.get("type");

      if (type === "invite" || type === "recovery") {
        setState("set-password");
      } else {
        // Обычный вход — просто на главную
        router.replace("/");
      }
    }

    init();
  }, [router]);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.replace("/");
  }

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8f4]">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-sm ring-1 ring-[#e6ebdf]">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#1f4d3a] border-t-transparent" />
          <p className="text-sm text-[#6b7280]">Активация ссылки...</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8f4] px-6">
        <div className="w-full max-w-md rounded-2xl bg-[#fef2f2] px-6 py-8 text-center ring-1 ring-[#fecaca]">
          <p className="text-lg font-semibold text-[#b91c1c]">Ссылка недействительна</p>
          <p className="mt-2 text-sm text-[#6b7280]">Запросите новую ссылку у администратора.</p>
          <a
            href="/login"
            className="mt-4 inline-block rounded-2xl bg-[#1f4d3a] px-5 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            На страницу входа
          </a>
        </div>
      </div>
    );
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#f6f8f4] px-6">
      <div className="w-full max-w-xl">
        <PageHeader eyebrow="WestKaz Agro" title="Установите пароль" />

        <SectionCard title="Придумайте пароль для входа" eyebrow="Добро пожаловать">
          <form onSubmit={handleSetPassword} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Новый пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
                autoFocus
                className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none focus:border-[#1f4d3a]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Повторите пароль</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Повторите пароль"
                required
                className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none focus:border-[#1f4d3a]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Сохранение..." : "Войти в систему"}
            </button>

            {error && (
              <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                {error}
              </div>
            )}
          </form>
        </SectionCard>
      </div>
    </section>
  );
}
