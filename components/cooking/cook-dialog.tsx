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

interface InventoryItem {
  id: string;
  name: string;
  remainingQuantity: number;
  totalQuantity: number;
  purchasePrice: number;
  unit: string;
}

export function CookDialog({
  onSuccess,
  trigger,
}: {
  onSuccess?: () => void;
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [dishName, setDishName] = useState("");
  const [yieldQuantity, setYieldQuantity] = useState<string>("1");
  const [unit, setUnit] = useState("食");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [ingredients, setIngredients] = useState<{ inventoryId: string; quantity: number }[]>([
    { inventoryId: "", quantity: 1 },
  ]);

  useEffect(() => {
    if (open) {
      void getActiveInventory().then((list) => setInventoryList(list as InventoryItem[]));
    }
  }, [open]);

  const addIngredient = () => {
    setIngredients([...ingredients, { inventoryId: "", quantity: 1 }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: "inventoryId" | "quantity",
    value: string | number,
  ) => {
    const newIngredients = [...ingredients];
    if (field === "inventoryId") {
      newIngredients[index].inventoryId = value as string;
    } else {
      newIngredients[index].quantity = Number(value);
    }
    setIngredients(newIngredients);
  };

  const calculateTotalCost = () => {
    return ingredients.reduce((total, ing) => {
      const item = inventoryList.find((i) => i.id === ing.inventoryId);
      if (item && item.totalQuantity > 0) {
        return total + (item.purchasePrice / item.totalQuantity) * ing.quantity;
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.some((ing) => !ing.inventoryId || ing.quantity <= 0)) {
      alert("食材と数量を正しく入力してください");
      return;
    }

    setLoading(true);
    try {
      await cookDish({
        dishName,
        yieldQuantity: Number(yieldQuantity),
        unit,
        ingredients,
        date,
      });
      onSuccess?.();
      setOpen(false);
      // Reset
      setIngredients([{ inventoryId: "", quantity: 1 }]);
      setDishName("");
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "調理の記録に失敗しました";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const totalCost = calculateTotalCost();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button className="gap-2">
              <Plus className="size-4" /> 料理を作る
            </Button>
          )
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
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="yield">出来上がり量</Label>
                  <Input
                    id="yield"
                    type="number"
                    value={yieldQuantity}
                    onChange={(e) => setYieldQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">単位</Label>
                  <Input
                    id="unit"
                    placeholder="食"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* 食材リスト */}
            <div className="space-y-3">
              <Label>使用する食材</Label>
              <div className="space-y-3">
                {ingredients.map((ing, index) => (
                  <div
                    key={index}
                    className="p-3 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50"
                  >
                    <div className="flex gap-2">
                      <Select
                        value={ing.inventoryId}
                        onValueChange={(val) => updateIngredient(index, "inventoryId", val || "")}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="食材を選択">
                            {ing.inventoryId
                              ? inventoryList.find((i) => i.id === ing.inventoryId)?.name
                              : "食材を選択"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                          {inventoryList.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-[10px] text-zinc-500">
                                  残り: {item.remainingQuantity}
                                  {item.unit}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={ing.quantity}
                          onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                          className="h-8 text-sm"
                        />
                        <span className="text-xs text-zinc-500">
                          {inventoryList.find((i) => i.id === ing.inventoryId)?.unit || ""}
                        </span>
                      </div>
                      {ingredients.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-zinc-400"
                          onClick={() => removeIngredient(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-dashed h-9 text-zinc-500"
                onClick={addIngredient}
              >
                <Plus className="size-3 mr-1" /> 食材を追加
              </Button>
            </div>

            {/* 原価計算の要約 */}
            <div className="bg-primary/5 p-4 rounded-2xl flex items-center justify-between border border-primary/10">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  推定原価 (合計)
                </div>
                <div className="text-xl font-black text-primary">
                  ¥{Math.ceil(totalCost).toLocaleString()}
                </div>
              </div>
              <div className="text-right space-y-1 text-zinc-500">
                <div className="text-[10px] font-bold uppercase tracking-widest">単価</div>
                <div className="text-sm font-bold">
                  1{unit}あたり ¥
                  {Number(yieldQuantity) > 0
                    ? Math.ceil(totalCost / Number(yieldQuantity)).toLocaleString()
                    : 0}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-bold"
              disabled={loading || !dishName}
            >
              {loading ? "調理を記録中..." : "調理完了 (在庫に追加)"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
