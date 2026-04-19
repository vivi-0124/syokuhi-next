"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsumeInventoryDialog } from "@/components/inventory/consume-inventory-dialog";

export function FloatingConsumeButton({
  selectedDate,
  onSuccess,
}: {
  selectedDate?: Date;
  onSuccess?: () => void;
}) {
  return (
    <div className="md:hidden">
      <ConsumeInventoryDialog
        selectedDate={selectedDate}
        onSuccess={onSuccess}
        trigger={
          <Button
            size="icon"
            className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg size-14 bg-orange-500 hover:bg-orange-600 border-none"
          >
            <Plus className="size-8" />
          </Button>
        }
      />
    </div>
  );
}
