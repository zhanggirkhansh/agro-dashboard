"use client";

import { useState } from "react";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError("Не удалось войти. Проверь email и пароль.");
      setLoading(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#f6f8f4] px-6">
      <div className="w-full max-w-xl">
        <PageHeader eyebrow="Авторизация" title="Вход в систему" />

        <SectionCard title="Введите данные" eyebrow="WestKaz Agro">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Введите email"
                required
                className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Пароль</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                required
                className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Вход..." : "Войти"}
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