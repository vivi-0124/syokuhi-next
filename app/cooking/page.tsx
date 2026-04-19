"use client";

import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ChefHat, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CookDialog } from "@/components/cooking/cook-dialog";
import { useState, useEffect } from "react";
import { getCookingHistory } from "@/app/actions/inventory";
import { CookingHistory } from "@/components/cooking/cooking-history";

export default function CookingPage() {
  const { data: session, isPending } = authClient.useSession();
  const [history, setHistory] = useState<any[]>([]);

  const refreshData = async () => {
    if (!session) return;
    try {
      const data = await getCookingHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch cooking history:", error);
    }
  };

  useEffect(() => {
    void refreshData();
  }, [session]);

  if (isPending) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!session) redirect("/");

  return (
    <div className="flex min-h-screen bg-white dark:bg-black font-sans">
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto min-h-full">
          <header className="px-4 py-8 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ChefHat className="size-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">調理記録</h1>
            </div>
            {/* ヘッダーのボタンは削除し、FABに一本化 */}
          </header>

          <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            最近の調理
          </div>

          <CookingHistory logs={history} />
        </div>
      </main>

      <BottomNav />

      {/* スマホ用フローティング調理ボタン */}
      <div className="md:hidden">
        <CookDialog
          onSuccess={refreshData}
          trigger={
            <Button
              size="icon"
              className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg size-14 bg-primary hover:bg-primary/90 border-none"
            >
              <Plus className="size-8" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
