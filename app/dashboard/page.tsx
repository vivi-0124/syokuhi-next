"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Utensils, History } from "lucide-react";
import { getDailyConsumptionSummary, getDashboardStats } from "@/app/actions/dashboard";
import { useEffect } from "react";
import { AddInventoryDialog } from "@/components/inventory/add-inventory-dialog";
import { ConsumeInventoryDialog } from "@/components/inventory/consume-inventory-dialog";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [expenses, setExpenses] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ todayTotal: 0, inventoryCount: 0 });

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        try {
          const [dailySummary, dashboardStats] = await Promise.all([
            getDailyConsumptionSummary(),
            getDashboardStats(),
          ]);
          setExpenses(dailySummary);
          setStats(dashboardStats);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        }
      };
      void fetchData();
    }
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
          <AddInventoryDialog />
          <Button variant="ghost" className="justify-start gap-2 text-zinc-500">
            <History className="size-4" />
            履歴
          </Button>
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                おかえりなさい、
              </p>
              <h1 className="text-3xl font-bold tracking-tight">{session.user.name}さん</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500">
                {format(new Date(), "yyyy年MM月dd日 (E)", { locale: ja })}
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 統計カード */}
            <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800/60">
              <CardHeader className="pb-2">
                <CardDescription>今日の支出</CardDescription>
                <CardTitle className="text-2xl">¥{stats.todayTotal.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-zinc-500">前日比: -</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800/60">
              <CardHeader className="pb-2">
                <CardDescription>今月の合計</CardDescription>
                <CardTitle className="text-2xl font-bold text-primary">
                  ¥
                  {Object.values(expenses)
                    .reduce((a, b) => a + b, 0)
                    .toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-zinc-500">予算残高: -</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800/60">
              <CardHeader className="pb-2">
                <CardDescription>在庫アイテム数</CardDescription>
                <CardTitle className="text-2xl">{stats.inventoryCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-zinc-500">賞味期限間近: 0</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* カレンダーセクション */}
            <Card className="lg:col-span-4 shadow-sm border-zinc-200/60 dark:border-zinc-800/60">
              <CardHeader>
                <CardTitle>カレンダー</CardTitle>
                <CardDescription>日々の消費と支出を確認できます。</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center p-0 pt-2 pb-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border-none w-full"
                  locale={ja}
                  expenses={expenses}
                />
              </CardContent>
            </Card>

            {/* 当日の詳細 */}
            <Card className="lg:col-span-3 shadow-sm border-zinc-200/60 dark:border-zinc-800/60">
              <CardHeader>
                <CardTitle>{date ? format(date, "MM月dd日") : "日付を選択"}</CardTitle>
                <CardDescription>この日のアクティビティ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-zinc-500 italic">データがありません</div>
                  <Separator />
                  <ConsumeInventoryDialog selectedDate={date} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
