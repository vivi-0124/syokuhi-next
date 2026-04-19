"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, AlertCircle } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  totalQuantity: number;
  remainingQuantity: number;
  unit: string;
  purchasePrice: number;
}

export function InventoryList({ items }: { items: InventoryItem[] }) {
  if (items.length === 0) {
    return (
      <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800/60">
        <CardContent className="pt-6 text-center text-zinc-500 italic">
          在庫がありません。新しいアイテムを登録してください。
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="size-5 text-primary" />
          現在の在庫状況
        </CardTitle>
        <CardDescription>ストックされている食材の管理</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const ratio = (item.remainingQuantity / item.totalQuantity) * 100;
          const isLow = ratio < 30;

          return (
            <div
              key={item.id}
              className="group relative flex flex-col gap-2 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                  <p className="text-xs text-zinc-500">
                    単価: ¥{Math.ceil(item.purchasePrice / item.totalQuantity)} / {item.unit}
                  </p>
                </div>
                {isLow && (
                  <Badge
                    variant="destructive"
                    className="flex gap-1 items-center px-1.5 py-0 text-[10px]"
                  >
                    <AlertCircle className="size-3" />
                    残りわずか
                  </Badge>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-500 uppercase tracking-wider">残量</span>
                  <span>
                    {item.remainingQuantity}{" "}
                    <span className="text-zinc-400 font-normal">
                      / {item.totalQuantity} {item.unit}
                    </span>
                  </span>
                </div>
                <Progress value={ratio} className="h-1.5" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
