"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  table: "livestock" | "expenses" | "feed" | "weighings" | "vaccines" | "sales" | "batches";
  id: number;
  label?: string;
  confirmMessage?: string;
  redirectTo?: string;
};

export default function DeleteButton({
  table,
  id,
  label = "Удалить",
  confirmMessage = "Удалить эту запись? Действие нельзя отменить.",
  redirectTo,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;
    setDeleting(true);

    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) {
      alert("Не удалось удалить запись. Попробуйте ещё раз.");
      setDeleting(false);
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-xl bg-[#fef2f2] px-3 py-1.5 text-sm font-medium text-[#b91c1c] ring-1 ring-[#fecaca] hover:bg-[#fee2e2] disabled:opacity-50"
    >
      {deleting ? "..." : label}
    </button>
  );
}
