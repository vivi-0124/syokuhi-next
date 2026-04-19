"use client";

import { LayoutDashboard, Package, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "ホーム", icon: LayoutDashboard, href: "/dashboard" },
    { label: "在庫", icon: Package, href: "/inventory" }, // まだページはないが枠組みとして
    { label: "履歴", icon: History, href: "/history" },
    { label: "設定", icon: Settings, href: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around px-2 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 gap-1 transition-colors",
              isActive
                ? "text-primary font-medium"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
            )}
          >
            <Icon className={cn("size-5", isActive && "stroke-[2.5px]")} />
            <span className="text-[10px] sm:text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
