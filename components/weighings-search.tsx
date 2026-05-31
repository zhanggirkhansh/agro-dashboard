"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";

type Props = { search: string };

export default function WeighingsSearch({ search }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(search);

  const submit = useCallback(
    (q: string) => {
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
    },
    [router, pathname]
  );

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit(value)}
        placeholder="Поиск по коду животного..."
        className="flex-1 rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
      />
      <button
        onClick={() => submit(value)}
        className="rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white hover:opacity-90"
      >
        Найти
      </button>
      {search && (
        <button
          onClick={() => { setValue(""); submit(""); }}
          className="rounded-2xl bg-white px-4 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
        >
          ✕
        </button>
      )}
    </div>
  );
}
