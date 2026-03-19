import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: "WestKaz Agro Dashboard",
  description: "Учет КРС, откорма, кормов, расходов и прибыли",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="bg-[#f5f7f2] text-[#1f2937]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}