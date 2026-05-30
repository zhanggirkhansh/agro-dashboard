import { LIVESTOCK_STATUS } from "@/constants/status";

type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    [LIVESTOCK_STATUS.ACTIVE]:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "Активный откорм":
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",

    [LIVESTOCK_STATUS.GAINING]:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200",

    [LIVESTOCK_STATUS.READY_FOR_SALE]:
      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    "Почти готова":
      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",

    [LIVESTOCK_STATUS.SOLD]:
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