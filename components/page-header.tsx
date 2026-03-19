type PageHeaderProps = {
  eyebrow: string;
  title: string;
  actionLabel?: string;
};

export default function PageHeader({
  eyebrow,
  title,
  actionLabel,
}: PageHeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <p className="text-sm text-[#6b7280]">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-semibold">{title}</h2>
      </div>

      {actionLabel ? (
        <button className="rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white shadow-sm hover:opacity-90">
          {actionLabel}
        </button>
      ) : null}
    </header>
  );
}