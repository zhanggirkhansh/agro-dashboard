type StatCardProps = {
  title: string;
  value: string;
  change?: string;
};

export default function StatCard({ title, value, change }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-[#e6ebdf] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]">
      <p className="text-sm text-[#6b7280]">{title}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-[#111827]">
        {value}
      </p>

      {change ? (
        <p className="mt-3 text-sm text-[#2f6a4f]">{change}</p>
      ) : null}
    </div>
  );
}