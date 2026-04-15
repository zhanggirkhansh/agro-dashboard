type SectionCardProps = {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  children: React.ReactNode;
};

export default function SectionCard({
  title,
  eyebrow,
  actionLabel,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-[28px] border border-[#e6ebdf] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-sm text-[#6b7280]">{eyebrow}</p>
          ) : null}
          <h3 className="mt-1 text-2xl font-semibold leading-tight text-[#111827]">
            {title}
          </h3>
        </div>

        {actionLabel ? (
          <button className="inline-flex items-center justify-center rounded-2xl bg-[#f3f6ef] px-4 py-2 text-sm font-medium text-[#1f4d3a] transition-all duration-200 hover:bg-[#e9f0e4] active:scale-[0.98]">
            {actionLabel}
          </button>
        ) : null}
      </div>

      {children}
    </section>
  );
}