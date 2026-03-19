type StatCardProps = {
  title: string;
  value: string;
  change?: string;
};

export default function StatCard({ title, value, change }: StatCardProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e6ebdf]">
      <p className="text-sm text-[#6b7280]">{title}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      {change ? <p className="mt-2 text-sm text-[#3f6f57]">{change}</p> : null}
    </div>
  );
}