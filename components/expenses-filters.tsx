"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  batches: { id: number; batch_name: string }[];
  supplier: string;
  dateFrom: string;
  dateTo: string;
  batch: string;
};

export default function ExpensesFilters({ batches, supplier, dateFrom, dateTo, batch }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [supplierValue, setSupplierValue] = useState(supplier);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setSupplierValue(supplier); }, [supplier]);

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSupplierChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSupplierValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => update("supplier", val), 400);
  }

  function reset() {
    setSupplierValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("supplier");
    params.delete("date_from");
    params.delete("date_to");
    params.delete("batch");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = supplierValue || dateFrom || dateTo || batch;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <input
          type="text"
          value={supplierValue}
          onChange={handleSupplierChange}
          placeholder="Поиск по поставщику..."
          className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#1f4d3a]"
        />

        <select
          value={batch}
          onChange={(e) => update("batch", e.target.value)}
          className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#1f4d3a]"
        >
          <option value="">Все партии</option>
          {batches.map((b) => (
            <option key={b.id} value={String(b.id)}>{b.batch_name}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => update("date_from", e.target.value)}
          className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#1f4d3a]"
          title="Начало периода"
        />

        <input
          type="date"
          value={dateTo}
          onChange={(e) => update("date_to", e.target.value)}
          className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#1f4d3a]"
          title="Конец периода"
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}
