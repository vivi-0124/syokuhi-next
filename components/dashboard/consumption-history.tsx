"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Utensils, ChevronRight } from "lucide-react";

interface HistoryItem {
  id: string;
  inventoryName: string;
  note: string | null;
  cost: number;
}

interface HistoryGroup {
  date: Date;
  items: HistoryItem[];
  total: number;
}

export function ConsumptionHistory({ groups }: { groups: HistoryGroup[] }) {
  if (groups.length === 0) {
    return <div className="text-center py-12 text-zinc-500 italic text-sm">履歴がありません</div>;
  }

  return (
    <div className="flex flex-col">
      {groups.map((group, gIdx) => (
        <div key={gIdx} className="mb-1">
          {/* 日付ヘッダー */}
          <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-2 flex justify-between items-center sticky top-0 z-10">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              {format(group.date, "yyyy年MM月dd日(E)", { locale: ja })}
            </span>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              -{group.total.toLocaleString()}円
            </span>
          </div>

          {/* アイテムリスト */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-4 py-3 active:bg-zinc-50 dark:active:bg-zinc-900 transition-colors"
              >
                <div className="p-2 bg-orange-100 dark:bg-orange-950/30 rounded-full">
                  <Utensils className="size-5 text-orange-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">食費</span>
                    {item.note && (
                      <span className="text-xs text-zinc-500 truncate">({item.note})</span>
                    )}
                    {!item.note && (
                      <span className="text-xs text-zinc-500 truncate">({item.inventoryName})</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    {item.cost.toLocaleString()}円
                  </span>
                  <ChevronRight className="size-4 text-zinc-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
