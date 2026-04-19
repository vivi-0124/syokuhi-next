"use client";

import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ChefHat, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CookDialog } from "@/components/cooking/cook-dialog";
import { useState } from "react";

export default function CookingPage() {
  const { data: session, isPending } = authClient.useSession();

  const handleRefresh = () => {
    // 将来的にデータを再取得する場合に使用
  };

  if (isPending) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!session) redirect("/");

  return (
    <div className="flex min-h-screen bg-zinc-50/50 dark:bg-black font-sans">
      {/* サイドバー */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 hidden md:flex flex-col gap-8">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Utensils className="size-6 text-primary" />
          <span>Syokuhi</span>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ChefHat className="size-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">料理</h1>
            </div>
            <CookDialog onSuccess={handleRefresh} />
          </header>

          <Card className="border-dashed border-2 shadow-none bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                <ChefHat className="size-8 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">レシピがまだありません</CardTitle>
                <CardDescription>
                  よく作る料理をレシピとして登録すると、在庫からの一括消費や原価計算が簡単になります。
                </CardDescription>
              </div>
              <Button variant="outline" className="mt-2">
                レシピを登録して始める
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            <h2 className="text-lg font-semibold">クイック消費</h2>
            <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800/60">
              <CardHeader>
                <CardTitle className="text-base">手動で食材を選ぶ</CardTitle>
                <CardDescription>
                  レシピを使わずに、使った食材をその場で選んで記録します。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  食材を選択して記録
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
