"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import EarTagCamera from "@/components/ear-tag-camera";
import { LIVESTOCK_STATUSES } from "@/constants/status";

type Props = {
  batches: { id: number; batch_name: string }[];
  search: string;
  status: string;
  batch: string;
};

export default function LivestockFilters({
  batches,
  search,
  status,
  batch,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key === "search") params.delete("tag");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, searchParams, pathname]
  );

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => update("search", val), 400);
  }

  function reset() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchValue("");
    router.push(pathname);
  }

  function openScannedTag(number: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push(pathname + "?" + new URLSearchParams({ tag: number }).toString());
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <input
          type="text"
          aria-label="Поиск по коду или ID"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Поиск по коду или ID..."
          className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
        />

        <select
          value={status}
          onChange={(e) => update("status", e.target.value)}
          className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
        >
          <option value="">Все статусы</option>
          {LIVESTOCK_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={batch}
          onChange={(e) => update("batch", e.target.value)}
          className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
        >
          <option value="">Все партии</option>
          {batches.map((b) => (
            <option key={b.id} value={b.batch_name}>
              {b.batch_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <EarTagCamera
          searchContext={JSON.stringify([searchValue, status, batch])}
          onNumber={openScannedTag}
          numberMessage={(number) => "Распознан номер " + number + "."}
        />
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>
  );
}
