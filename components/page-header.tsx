import Link from "next/link";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function PageHeader({
  eyebrow,
  title,
  actionLabel,
  actionHref,
}: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm text-[#6b7280]">{eyebrow}</p>
        <h2 className="mt-1 break-words text-2xl font-semibold leading-tight sm:text-3xl">
          {title}
        </h2>
      </div>

      {actionLabel &&
        (actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1f4d3a] px-5 py-3 text-center font-medium text-white shadow-sm hover:opacity-90 sm:w-auto"
          >
            {actionLabel}
          </Link>
        ) : (
          <button className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1f4d3a] px-5 py-3 text-center font-medium text-white shadow-sm hover:opacity-90 sm:w-auto">
            {actionLabel}
          </button>
        ))}
    </header>
  );
}