import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/app-shell";
import { ToastProvider } from "@/components/toast-provider";
import SWRegister from "@/components/sw-register";

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var s = localStorage.getItem('theme');
              var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (s === 'dark' || (!s && d)) {
                document.documentElement.classList.add('dark');
              } else if (s === 'light') {
                document.documentElement.setAttribute('data-theme','light');
              }
            } catch(e){}
          })();
        `}} />
      </head>
      <body className="bg-[#f5f7f2] text-[#1f2937]">
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
        <SWRegister />
      </body>
    </html>
  );
}