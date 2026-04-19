"use client";

import { useState, useEffect } from "react";
import { ja } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Utensils, ChefHat } from "lucide-react";
import { getDailyConsumptionSummary, getConsumptionHistory } from "@/app/actions/dashboard";
import { getActiveInventory } from "@/app/actions/inventory";
import { AddInventoryDialog } from "@/components/inventory/add-inventory-dialog";
import { ConsumeInventoryDialog } from "@/components/inventory/consume-inventory-dialog";
import { InventoryList } from "@/components/inventory/inventory-list";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingAddButton } from "@/components/inventory/floating-add-button";
import { ConsumptionHistory } from "@/components/dashboard/consumption-history";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [expenses, setExpenses] = useState<Record<string, number>>({});
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [historyGroups, setHistoryGroups] = useState<any[]>([]);

  const refreshData = async () => {
    if (!session) return;
    try {
      const [dailySummary, activeInventory, history] = await Promise.all([
        getDailyConsumptionSummary(),
        getActiveInventory(),
        getConsumptionHistory(),
      ]);
      setExpenses(dailySummary);
      setInventoryItems(activeInventory);
      setHistoryGroups(history);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  useEffect(() => {
    void refreshData();
  }, [session]);

  if (isPending) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-zinc-50/50 dark:bg-black font-sans">
      {/* サイドバー (簡易版) */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 hidden md:flex flex-col gap-8">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Utensils className="size-6 text-primary" />
          <span>Syokuhi</span>
        </div>

        <nav className="flex flex-col gap-2">
          <Button variant="secondary" className="justify-start gap-2">
            <LayoutDashboard className="size-4" />
            ダッシュボード
          </Button>
          <AddInventoryDialog onSuccess={refreshData} />
          <Button variant="ghost" className="justify-start gap-2 text-zinc-500">
            <ChefHat className="size-4" />
            料理
          </Button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto pb-24 dark:bg-black">
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-950 min-h-full shadow-xl">
          {/* カレンダーセクション */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md w-full"
              locale={ja}
              expenses={expenses}
            />
          </div>

          {/* 収支サマリーバー */}
          <div className="grid grid-cols-3 bg-zinc-900 text-white py-4 text-center">
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-400">収入</div>
              <div className="text-sm font-bold text-sky-400">0円</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-400">支出</div>
              <div className="text-sm font-bold text-orange-400">
                {Object.values(expenses)
                  .reduce((a, b) => a + b, 0)
                  .toLocaleString()}
                円
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-400">合計</div>
              <div className="text-sm font-bold text-orange-400">
                -
                {Object.values(expenses)
                  .reduce((a, b) => a + b, 0)
                  .toLocaleString()}
                円
              </div>
            </div>
          </div>

          {/* 履歴リスト */}
          <ConsumptionHistory groups={historyGroups} />

          {/* クイックアクション (任意で残す) */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">現在の在庫</h3>
              <Link href="/inventory" className="text-xs text-primary underline">
                すべて見る
              </Link>
            </div>
            <InventoryList items={inventoryItems.slice(0, 3)} />
            <ConsumeInventoryDialog selectedDate={date} onSuccess={refreshData} />
          </div>
        </div>
      </main>
      <BottomNav />
      <FloatingAddButton onSuccess={refreshData} />
    </div>
  );
}
