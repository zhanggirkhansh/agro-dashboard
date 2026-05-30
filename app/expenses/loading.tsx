import PageSkeleton from "@/components/page-skeleton";

export default function ExpensesLoading() {
  return <PageSkeleton statCount={3} itemCount={5} hassidebar={false} />;
}
