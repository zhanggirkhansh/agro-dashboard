"use client";

import { useSyncExternalStore } from "react";
import { farmDate, formatLivestockAge } from "@/lib/livestock-age";

const listeners = new Set<() => void>();
let timer: number | undefined;
let lastDate: string;

function updateDate() {
  const date = farmDate();
  if (date === lastDate) return;
  lastDate = date;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === undefined) {
    lastDate = farmDate();
    timer = window.setInterval(updateDate, 30_000);
    document.addEventListener("visibilitychange", updateDate);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.clearInterval(timer);
      timer = undefined;
      document.removeEventListener("visibilitychange", updateDate);
    }
  };
}

type Props = {
  age: string | null;
  registeredAt: string | null;
  asOfDate: string;
};

export default function LivestockAge({ age, registeredAt, asOfDate }: Props) {
  const date = useSyncExternalStore(subscribe, farmDate, () => asOfDate);
  return formatLivestockAge(age, registeredAt, date);
}
