import {
  LayoutDashboard,
  Beef,
  Boxes,
  Wheat,
  Wallet,
  Scale,
  ShoppingCart,
  BarChart3,
  Settings,
  Syringe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type UserRole = "admin" | "zoologist" | "accountant";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Директор",
  zoologist: "Зоотехник",
  accountant: "Бухгалтер",
};

export const ALL_ROLES: UserRole[] = ["admin", "zoologist", "accountant"];

export type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export const NAV_ITEMS: MenuItem[] = [
  { label: "Dashboard",     href: "/",           icon: LayoutDashboard, roles: ["admin", "zoologist", "accountant"] },
  { label: "Поголовье",     href: "/livestock",  icon: Beef,            roles: ["admin", "zoologist"] },
  { label: "Партии",        href: "/batches",    icon: Boxes,           roles: ["admin", "zoologist"] },
  { label: "Взвешивания",   href: "/weighings",  icon: Scale,           roles: ["admin", "zoologist"] },
  { label: "Вакцины",       href: "/vaccines",   icon: Syringe,         roles: ["admin", "zoologist"] },
  { label: "Корма",         href: "/feed",       icon: Wheat,           roles: ["admin", "accountant"] },
  { label: "Расходы",       href: "/expenses",   icon: Wallet,          roles: ["admin", "accountant"] },
  { label: "Продажи",       href: "/sales",      icon: ShoppingCart,    roles: ["admin", "accountant"] },
  { label: "Аналитика",     href: "/analytics",  icon: BarChart3,       roles: ["admin", "accountant"] },
  { label: "Настройки",     href: "/settings",   icon: Settings,        roles: ["admin"] },
];

export function getMenuForRole(role: UserRole | null): MenuItem[] {
  if (!role) return NAV_ITEMS;
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function canAccess(role: UserRole | null, href: string): boolean {
  if (!role) return true;
  const item = NAV_ITEMS.find((i) => i.href === href);
  if (!item) return role === "admin";
  return item.roles.includes(role);
}
