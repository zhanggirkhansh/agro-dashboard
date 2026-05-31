"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SectionCard from "@/components/section-card";
import PageHeader from "@/components/page-header";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [type, setType] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase кладёт токены в хэш — ждём пока клиент их подхватит
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") {
          const hash = window.location.hash;
          const params = new URLSearchParams(hash.replace("#", ""));
          const t = params.get("type");
          setType(t);
          setReady(true);

          // Если не invite и не recovery — просто редирект на главную
          if (t !== "invite" && t !== "recovery") {
            router.replace("/");
          }
        }
      }
    );

    return () => subscription.unsubscribe();
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

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8f4]">
        <div className="rounded-2xl bg-white px-6 py-4 text-sm text-[#6b7280] shadow-sm ring-1 ring-[#e6ebdf]">
          Проверка ссылки...
        </div>
      </div>
    );
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#f6f8f4] px-6">
      <div className="w-full max-w-xl">
        <PageHeader eyebrow="Добро пожаловать" title="Установите пароль" />

        <SectionCard title="Придумайте пароль" eyebrow="WestKaz Agro">
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
              disabled={loading}
              className="w-full rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Сохранение..." : "Войти в систему"}
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
