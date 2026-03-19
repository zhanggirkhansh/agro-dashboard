type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    "Активный": "bg-[#edf5ee] text-[#2f6a4f]",
    "Активный откорм": "bg-[#edf5ee] text-[#2f6a4f]",
    "Набор массы": "bg-[#fff7e8] text-[#b7791f]",
    "Готовится к продаже": "bg-[#eef2ff] text-[#4f46e5]",
    "Почти готова": "bg-[#eef2ff] text-[#4f46e5]",
    "Продан": "bg-[#f3f4f6] text-[#4b5563]",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        styles[status] ?? "bg-[#f3f4f6] text-[#4b5563]"
      }`}
    >
      {status}
    </span>
  );
}