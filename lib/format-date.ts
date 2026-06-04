export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr || dateStr === "—") return "—";
  // Parse as local date to avoid UTC offset shifting day by 1
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
