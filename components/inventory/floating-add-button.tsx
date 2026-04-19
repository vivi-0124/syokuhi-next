"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddInventoryDialog } from "@/components/inventory/add-inventory-dialog";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addInventory } from "@/app/actions/inventory";

export function FloatingAddButton({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await addInventory({
        name: formData.get("name") as string,
        totalQuantity: Number(formData.get("totalQuantity")),
        unit: formData.get("unit") as string,
        purchasePrice: Number(formData.get("purchasePrice")),
      });
      onSuccess?.();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="icon-lg"
            className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg md:hidden size-14"
          >
            <Plus className="size-6" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>在庫登録</DialogTitle>
            <DialogDescription>購入した商品を在庫として登録します。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">品名</Label>
              <Input id="name" name="name" placeholder="例: 牛乳" required />
            </div>
            {/* 簡易版フォームを dialog の中に */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalQuantity">総量</Label>
                <Input id="totalQuantity" name="totalQuantity" type="number" step="0.1" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">単位</Label>
                <Input id="unit" name="unit" placeholder="本" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purchasePrice">購入価格 (円)</Label>
              <Input id="purchasePrice" name="purchasePrice" type="number" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "登録中..." : "登録する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
