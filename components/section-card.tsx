type SectionCardProps = {
  eyebrow?: string;
  title: string;
  actionLabel?: string;
  children: React.ReactNode;
};

export default function SectionCard({
  eyebrow,
  title,
  actionLabel,
  children,
}: SectionCardProps) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e6ebdf]">
      <div className="flex items-center justify-between">
        <div>
          {eyebrow ? <p className="text-sm text-[#6b7280]">{eyebrow}</p> : null}
          <h3 className="mt-1 text-xl font-semibold">{title}</h3>
        </div>

        {actionLabel ? (
          <button className="text-sm font-medium text-[#2f6a4f]">
            {actionLabel}
          </button>
        ) : null}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}