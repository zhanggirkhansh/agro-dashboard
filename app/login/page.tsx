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
    <section className="flex min-h-screen items-center justify-center bg-[#f6f8f4] px-6 dark:bg-[#0d1810]">
      <div className="w-full max-w-xl">
        <PageHeader eyebrow="Авторизация" title="Вход в систему" />

        <div className="rounded-[28px] border border-[#e6ebdf] bg-white p-5 shadow-sm sm:p-6 dark:border-[#1e3326] dark:bg-[#122018]">
          <p className="text-sm text-[#6b7280] dark:text-[#7b9882]">WestKaz Agro</p>
          <h3 className="mt-1 text-2xl font-semibold text-[#111827] dark:text-[#ddeadf]">Введите данные</h3>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-[#ddeadf]">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Введите email"
                required
                className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none dark:border-[#1e3326] dark:bg-[#0d1810] dark:text-[#ddeadf] dark:placeholder-[#567060]"
                style={{ colorScheme: "light dark" }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium dark:text-[#ddeadf]">Пароль</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                required
                className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none dark:border-[#1e3326] dark:bg-[#0d1810] dark:text-[#ddeadf] dark:placeholder-[#567060]"
                style={{ colorScheme: "light dark" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60 dark:bg-[#265c46]"
            >
              {loading ? "Вход..." : "Войти"}
            </button>

            {error && (
              <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] dark:bg-[#220e0e] dark:text-[#f87171]">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}