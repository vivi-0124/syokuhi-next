"use client";

import { useState, useEffect } from "react";
import { ja } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Utensils, ChefHat, Settings } from "lucide-react";
import { getDailyConsumptionSummary, getConsumptionHistory } from "@/app/actions/dashboard";
import Link from "next/link";
import { AddInventoryDialog } from "@/components/inventory/add-inventory-dialog";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingConsumeButton } from "@/components/inventory/floating-consume-button";
import { ConsumptionHistory } from "@/components/dashboard/consumption-history";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import Image from "next/image";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [expenses, setExpenses] = useState<Record<string, number>>({});
  const [historyGroups, setHistoryGroups] = useState<any[]>([]);

  const refreshData = async () => {
    if (!session) return;
    try {
      const [dailySummary, history] = await Promise.all([
        getDailyConsumptionSummary(),
        getConsumptionHistory(),
      ]);
      setExpenses(dailySummary);
      setHistoryGroups(history);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  useEffect(() => {
    if (session) {
      void refreshData();
    }
  }, [session]);

  if (isPending) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  // 未ログイン時の表示
  if (!session) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
        <main className="flex flex-1 w-full max-w-md flex-col items-center justify-center p-8 bg-white dark:bg-black space-y-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-primary/10 rounded-3xl mb-4">
              <Utensils className="size-12 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-black dark:text-zinc-50">
              SYOKUHI
            </h1>
            <p className="text-zinc-500 text-sm max-w-[240px]">
              食費と在庫をスマートに管理する、
              <br />
              次世代の家計簿アプリ
            </p>
          </div>

          <div className="w-full space-y-4">
            <GoogleSignInButton />
          </div>
        </main>
      </div>
    );
  }

  // ログイン済みの表示 (旧ダッシュボード)
  return (
    <div className="flex min-h-screen bg-zinc-50/50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
      {/* サイドバー (デスクトップ用) */}
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
          <Button
            variant="ghost"
            className="justify-start gap-2 text-zinc-500"
            nativeButton={false}
            render={
              <Link href="/cooking">
                <ChefHat className="size-4" />
                料理
              </Link>
            }
          />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto pb-24 dark:bg-black">
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-950 min-h-full shadow-xl">
          {/* ヘッダーセクション */}
          <header className="sticky top-0 z-30 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
            <div className="px-4 py-3 flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight">カレンダー</h1>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="size-5" />
                </Button>
              </Link>
            </div>

            {/* 収支サマリーバー */}
            <div className="grid grid-cols-3 bg-white dark:bg-zinc-950 py-4 text-center border-t border-zinc-100 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  予算
                </div>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {((session?.user as any)?.budget || 50000).toLocaleString()}円
                </div>
              </div>
              <div className="space-y-1 border-x border-zinc-50 dark:border-zinc-900">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  支出
                </div>
                <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {Object.values(expenses)
                    .reduce((a, b) => a + b, 0)
                    .toLocaleString()}
                  円
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  残り
                </div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {(
                    ((session?.user as any)?.budget || 50000) -
                    Object.values(expenses).reduce((a, b) => a + b, 0)
                  ).toLocaleString()}
                  円
                </div>
              </div>
            </div>
          </header>

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

          {/* 履歴リスト */}
          <ConsumptionHistory groups={historyGroups} />
        </div>
      </main>
      <BottomNav />
      <FloatingConsumeButton selectedDate={date} onSuccess={refreshData} />
    </div>
  );
}
