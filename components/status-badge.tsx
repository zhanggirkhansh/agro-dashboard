type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    "Активный":
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "Активный откорм":
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",

    "Набор массы":
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200",

    "Готовится к продаже":
      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    "Почти готова":
      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",

    "Продан":
      "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };

  return (
    <span
      className={`
        inline-flex items-center
        rounded-full px-3 py-1 text-xs font-medium
        transition-all duration-200
        ${styles[status] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"}
      `}
    >
      {status}
    </span>
  );
}