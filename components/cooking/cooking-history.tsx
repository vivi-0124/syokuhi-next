"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChefHat, ChevronRight, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Ingredient {
  id: string;
  quantity: number;
  inventory: {
    name: string;
    unit: string;
    purchasePrice: number;
    totalQuantity: number;
  };
}

interface CookingLog {
  id: string;
  dishName: string;
  yieldQuantity: number;
  unit: string;
  totalCost: number;
  createdAt: Date;
  ingredients: Ingredient[];
}

export function CookingHistory({ logs }: { logs: CookingLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 italic text-sm">調理履歴がありません</div>
    );
  }

  return (
    <div className="flex flex-col">
      {logs.map((log) => (
        <Dialog key={log.id}>
          <DialogTrigger
            render={
              <div className="flex items-center gap-4 px-4 py-3 active:bg-zinc-50 dark:active:bg-zinc-900 transition-colors border-b border-zinc-100 dark:border-zinc-800 cursor-pointer">
                <div className="p-2 bg-primary/10 rounded-full">
                  <ChefHat className="size-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{log.dishName}</div>
                  <div className="text-[10px] text-zinc-500">
                    {format(new Date(log.createdAt), "yyyy/MM/dd HH:mm", { locale: ja })} •{" "}
                    {log.yieldQuantity}
                    {log.unit}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    {log.totalCost.toLocaleString()}円
                  </span>
                  <ChevronRight className="size-4 text-zinc-300" />
                </div>
              </div>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{log.dishName} の詳細</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-end p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">合計原価</div>
                  <div className="text-2xl font-bold">{log.totalCost.toLocaleString()}円</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">出来高</div>
                  <div className="text-sm font-medium">
                    {log.yieldQuantity}
                    {log.unit} ({Math.ceil(log.totalCost / log.yieldQuantity)}円/1{log.unit})
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                  <Info className="size-3" /> 使用した食材
                </h4>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border rounded-lg overflow-hidden">
                  {log.ingredients.map((ing) => {
                    const cost = Math.ceil(
                      (ing.inventory.purchasePrice / ing.inventory.totalQuantity) * ing.quantity,
                    );
                    return (
                      <div key={ing.id} className="flex justify-between items-center p-3 text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{ing.inventory.name}</span>
                          <span className="text-xs text-zinc-500">
                            {ing.quantity}
                            {ing.inventory.unit}
                          </span>
                        </div>
                        <span className="font-bold">{cost.toLocaleString()}円</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
