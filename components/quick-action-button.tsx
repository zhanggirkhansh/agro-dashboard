"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Weight,
  DollarSign,
  ShoppingCart,
  Syringe,
  Wheat,
} from "lucide-react";

const ACTIONS = [
  { label: "Добавить животное",    href: "/livestock/new",  icon: Plus },
  { label: "Добавить взвешивание", href: "/weighings/new",  icon: Weight },
  { label: "Добавить расход",      href: "/expenses/new",   icon: DollarSign },
  { label: "Оформить продажу",     href: "/sales/new",      icon: ShoppingCart },
  { label: "Добавить вакцинацию",  href: "/vaccines/new",   icon: Syringe },
  { label: "Добавить корм",        href: "/feed/new",       icon: Wheat },
];

export default function QuickActionButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white shadow-sm hover:opacity-90 sm:w-auto"
      >
        <Plus size={16} />
        Быстрое действие
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[#e6ebdf] bg-white shadow-xl dark:border-[#1e3326] dark:bg-[#122018] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          {ACTIONS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-[#1f2937] hover:bg-[#f3f6ef] hover:text-[#1f4d3a] dark:text-[#ddeadf] dark:hover:bg-[#1e3326] dark:hover:text-[#52c48a]"
            >
              <Icon size={15} className="shrink-0 text-[#2f6a4f] dark:text-[#52c48a]" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
