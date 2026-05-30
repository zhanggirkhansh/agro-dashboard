"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Props = {
  page: number;
  totalCount: number;
  pageSize: number;
};

export default function Pagination({ page, totalCount, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  function navigate(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#6b7280]">
        {from}–{to} из {totalCount}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(page - 1)}
          disabled={page <= 1}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Назад
        </button>

        <span className="text-sm text-[#6b7280]">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => navigate(page + 1)}
          disabled={page >= totalPages}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
}
