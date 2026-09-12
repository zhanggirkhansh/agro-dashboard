"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function VaccinesSearch({ search }: { search: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [value, setValue] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(search);
  }, [search]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) {
        params.set("search", val);
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 400);
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Поиск по коду животного..."
      className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none focus:border-[#1f4d3a]"
    />
  );
}
