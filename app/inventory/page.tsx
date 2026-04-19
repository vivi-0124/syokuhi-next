"use client";

import { useEffect, useState } from "react";
import { getActiveInventory } from "@/app/actions/inventory";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { InventoryList } from "@/components/inventory/inventory-list";
import { AddInventoryDialog } from "@/components/inventory/add-inventory-dialog";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingAddButton } from "@/components/inventory/floating-add-button";
import { Package, Utensils } from "lucide-react";

export default function InventoryPage() {
  const { data: session, isPending } = authClient.useSession();
  const [items, setItems] = useState<any[]>([]);

  const fetchItems = async () => {
    if (!session) return;
    try {
      const data = await getActiveInventory();
      setItems(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void fetchItems();
  }, [session]);

  if (isPending) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!session) redirect("/");

  return (
    <div className="flex min-h-screen bg-zinc-50/50 dark:bg-black font-sans">
      {/* サイドバー (Dashboardと共通の枠組み) */}
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
                <Package className="size-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">在庫管理</h1>
            </div>
            <div className="hidden md:block">
              <AddInventoryDialog onSuccess={fetchItems} />
            </div>
          </header>

          <InventoryList items={items} showDelete={true} onRefresh={fetchItems} />
        </div>
      </main>

      <BottomNav />
      <FloatingAddButton onSuccess={fetchItems} />
    </div>
  );
}
