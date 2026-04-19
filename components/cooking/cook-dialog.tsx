"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChefHat, Calculator, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getActiveInventory, cookDish } from "@/app/actions/inventory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function CookDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<
    { inventoryId: string; quantity: number }[]
  >([{ inventoryId: "", quantity: 0 }]);
  const [dishInfo, setDishInfo] = useState({ name: "", yield: 1, unit: "食" });
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (open) {
      void getActiveInventory().then(setInventoryList);
    }
  }, [open]);

  const addIngredient = () => {
    setSelectedIngredients([...selectedIngredients, { inventoryId: "", quantity: 0 }]);
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const newIngredients = [...selectedIngredients];
    (newIngredients[index] as any)[field] = value;
    setSelectedIngredients(newIngredients);
  };

  const calculateTotalCost = () => {
    return selectedIngredients.reduce((total, ing) => {
      const item = inventoryList.find((i) => i.id === ing.inventoryId);
      if (item) {
        return total + (item.purchasePrice / item.totalQuantity) * ing.quantity;
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIngredients.some((ing) => !ing.inventoryId || ing.quantity <= 0)) {
      alert("食材と数量を正しく入力してください");
      return;
    }

    setLoading(true);
    try {
      await cookDish({
        dishName: dishInfo.name,
        yieldQuantity: dishInfo.yield,
        unit: dishInfo.unit,
        ingredients: selectedIngredients,
        date: date,
      });
      onSuccess?.();
      setOpen(false);
      // Reset
      setSelectedIngredients([{ inventoryId: "", quantity: 0 }]);
      setDishInfo({ name: "", yield: 1, unit: "食" });
    } catch (error: any) {
      console.error(error);
      alert(error.message || "調理の記録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const totalCost = calculateTotalCost();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="size-4" /> 料理を作る
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="size-5 text-primary" />
              料理をして在庫に変換
            </DialogTitle>
            <DialogDescription>
              食材を選んで調理し、新しい在庫アイテム（作り置き）を作成します。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label>調理日</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal border-zinc-200 dark:border-zinc-800",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ja }) : <span>日付を選択</span>}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ja}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 料理名セクション */}
            <div className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <div className="grid gap-2">
                <Label htmlFor="dishName">出来上がった料理の名前</Label>
                <Input
                  id="dishName"
                  placeholder="例: カレー"
                  value={dishInfo.name}
                  onChange={(e) => setDishInfo({ ...dishInfo, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="yield">出来高 (数量)</Label>
                  <Input
                    id="yield"
                    type="number"
                    value={dishInfo.yield}
                    onChange={(e) => setDishInfo({ ...dishInfo, yield: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dishUnit">単位</Label>
                  <Input
                    id="dishUnit"
                    placeholder="食"
                    value={dishInfo.unit}
                    onChange={(e) => setDishInfo({ ...dishInfo, unit: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* 食材セクション */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">使用する食材</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={addIngredient}
                  className="gap-1"
                >
                  <Plus className="size-3" /> 食材を追加
                </Button>
              </div>

              <div className="space-y-3">
                {selectedIngredients.map((ing, index) => (
                  <div
                    key={index}
                    className="flex items-end gap-2 bg-white dark:bg-black p-2 rounded border border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="flex-1 space-y-2">
                      <Select
                        value={ing.inventoryId}
                        onValueChange={(val) => updateIngredient(index, "inventoryId", val)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="食材を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryList.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} (残:{item.remainingQuantity}
                              {item.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="数量"
                          className="h-8"
                          value={ing.quantity || ""}
                          onChange={(e) =>
                            updateIngredient(index, "quantity", Number(e.target.value))
                          }
                        />
                        <span className="text-xs text-zinc-500 whitespace-nowrap">
                          {inventoryList.find((i) => i.id === ing.inventoryId)?.unit || ""}
                        </span>
                      </div>
                    </div>
                    {selectedIngredients.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 text-zinc-400 hover:text-destructive"
                        onClick={() => removeIngredient(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* コスト計算プレビュー */}
            <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Calculator className="size-5" />
                <span className="text-sm font-medium">合計原価 (自動計算)</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  ¥{Math.ceil(totalCost).toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-500">
                  1{dishInfo.unit}あたり ¥
                  {dishInfo.yield > 0 ? Math.ceil(totalCost / dishInfo.yield).toLocaleString() : 0}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading || !dishInfo.name}>
              {loading ? "調理を記録中..." : "調理完了 (在庫に追加)"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
