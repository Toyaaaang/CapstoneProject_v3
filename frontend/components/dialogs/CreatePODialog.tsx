"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "@/lib/axios";

type CreatePODialogProps = {
  rv: {
    id: number;
    rv_no: string;
    department: string;
    requested_by: string;
    created_at: string;
    items: {
      id: number;
      material_name: string;
      quantity: number;
      unit: string;
    }[];
  };
  refreshData: () => void;
};

export default function CreatePODialog({ rv, refreshData }: CreatePODialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState(
    rv.items.map((item) => ({
      ...item,
      unit_price: 0,
      total_price: 0,
    }))
  );

  const updateItem = (index: number, value: number) => {
    const updated = [...items];
    updated[index].unit_price = value;
    updated[index].total_price = value * updated[index].quantity;
    setItems(updated);
  };

  const grandTotal = items.reduce((sum, i) => sum + i.total_price, 0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post("/budget-analyst/po/create/", {
        rv_id: rv.id,
        items: items.map((i) => ({
          material_id: i.id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      });
      toast.success("Purchase Order created");
      setOpen(false);
      refreshData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create PO");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Create PO</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create PO for RV #{rv.rv_no}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Department: {rv.department} | Requested By: {rv.requested_by}
            </p>
          </DialogHeader>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex flex-wrap gap-4 items-center border p-3 rounded-md"
              >
                <div className="w-64 font-medium">{item.material_name}</div>
                <div className="text-sm text-muted-foreground">
                  Qty: {item.quantity} {item.unit}
                </div>
                <Input
                  type="number"
                  className="w-32"
                  min={0}
                  step="0.01"
                  placeholder="Unit Price"
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, parseFloat(e.target.value) || 0)}
                />
                <div className="text-sm font-semibold">
                  Total: ₱{item.total_price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="text-right font-bold text-lg mt-4">
            Grand Total: ₱{grandTotal.toFixed(2)}
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Submit PO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
