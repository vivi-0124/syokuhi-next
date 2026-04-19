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
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { consumeInventory, getActiveInventory } from "@/app/actions/inventory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ConsumeInventoryDialog({
  selectedDate,
  onSuccess,
}: {
  selectedDate?: Date;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) setDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (open) {
      void getActiveInventory().then(setInventoryList);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await consumeInventory({
        inventoryId: formData.get("inventoryId") as string,
        quantity: Number(formData.get("quantity")),
        note: formData.get("note") as string,
        date: date,
      });
      onSuccess?.();
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "記録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full gap-2" variant="outline">
            <Plus className="size-4" /> 消費を記録
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>消費の記録</DialogTitle>
            <DialogDescription>在庫から消費した分を入力してください。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>日付</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
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
            <div className="grid gap-2">
              <Label htmlFor="inventoryId">アイテムを選択</Label>
              <Select name="inventoryId" required>
                <SelectTrigger>
                  <SelectValue placeholder="在庫から選ぶ" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryList.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (残: {item.remainingQuantity}
                      {item.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">消費量</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.1"
                placeholder="1.0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">メモ</Label>
              <Input id="note" name="note" placeholder="例: 朝食" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || inventoryList.length === 0}>
              {loading ? "記録中..." : "記録する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
