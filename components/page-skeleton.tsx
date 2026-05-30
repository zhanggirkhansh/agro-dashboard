function Bone({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-[#e6ebdf] ${className}`} />
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e6ebdf]">
      <Bone className="h-3 w-24" />
      <Bone className="mt-3 h-7 w-32" />
      <Bone className="mt-2 h-3 w-20" />
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <div className="rounded-2xl border border-[#ebf0e6] bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Bone className="h-4 w-40" />
          <Bone className="h-3 w-24" />
        </div>
        <Bone className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Bone className="h-14 rounded-xl" />
        <Bone className="h-14 rounded-xl" />
        <Bone className="h-14 rounded-xl" />
        <Bone className="h-14 rounded-xl" />
      </div>
    </div>
  );
}

type Props = {
  statCount?: number;
  itemCount?: number;
  hassidebar?: boolean;
};

export default function PageSkeleton({
  statCount = 4,
  itemCount = 5,
  hassidebar = true,
}: Props) {
  return (
    <section>
      {/* Заголовок */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-3 w-32" />
          <Bone className="h-8 w-48" />
        </div>
        <Bone className="h-11 w-36 rounded-2xl" />
      </div>

      {/* Стат-карточки */}
      <div
        className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${
          statCount === 3
            ? "xl:grid-cols-3"
            : statCount === 4
              ? "xl:grid-cols-4"
              : "xl:grid-cols-3"
        }`}
      >
        {Array.from({ length: statCount }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Контент */}
      <div
        className={`mt-6 grid grid-cols-1 gap-5 ${hassidebar ? "xl:grid-cols-3" : ""}`}
      >
        <div className={hassidebar ? "xl:col-span-2" : ""}>
          <div className="rounded-3xl bg-white p-6 ring-1 ring-[#e6ebdf]">
            <div className="mb-5 space-y-2">
              <Bone className="h-3 w-24" />
              <Bone className="h-5 w-40" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: itemCount }).map((_, i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        {hassidebar && (
          <div className="rounded-3xl bg-white p-6 ring-1 ring-[#e6ebdf]">
            <div className="mb-5 space-y-2">
              <Bone className="h-3 w-20" />
              <Bone className="h-5 w-32" />
            </div>
            <div className="space-y-4">
              <Bone className="h-24 rounded-2xl" />
              <Bone className="h-24 rounded-2xl" />
              <Bone className="h-24 rounded-2xl" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
