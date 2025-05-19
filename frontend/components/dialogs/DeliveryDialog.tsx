"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { format } from "date-fns";

type ValidateDeliveryDialogProps = {
  po: any;
  refreshData: () => void;
};

export default function ValidateDeliveryDialog({ po, refreshData }: ValidateDeliveryDialogProps) {
  const [open, setOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState(
    po.items.map((item: any) => ({
      material_id: item.material.id,
      name: item.material.name,
      quantity: item.quantity,
      unit: item.unit,
      delivered_quantity: item.quantity,
      delivery_status: "complete",
      remarks: "",
    }))
  );

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`/requests/purchase-orders/${po.id}/record-delivery/`, {
        delivery_date: deliveryDate,
        items: items.map((item) => ({
          material_id: item.material_id,
          delivered_quantity: item.delivered_quantity,
          delivery_status: item.delivery_status,
          remarks: item.remarks,
        })),
      });

      toast.success("Delivery recorded.");
      setOpen(false);
      refreshData();
    } catch (err) {
      toast.error("Failed to submit delivery.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Validate Delivery</Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Validate Delivery for {po.po_number}</DialogTitle>
        </DialogHeader>

        <div className="mb-2 space-y-2">
          <Label className="pl-1">Delivery Date</Label>
          <Input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>

        <div className="max-h-72 overflow-y-auto mt-2 pr-1 space-y-2">
          {items.map((item, index) => (
            <div key={index} className="border rounded-md p-3 text-sm space-y-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-muted-foreground">Ordered: {item.quantity} {item.unit}</div>

              <div className="flex gap-2 mt-2 flex-wrap">
                <div className="flex flex-col">
                  <Label className="text-xs pl-1">Delivered Qty</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-32"
                    value={item.delivered_quantity}
                    onChange={(e) =>
                      updateItem(index, "delivered_quantity", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <Label className="text-xs pl-1">Status</Label>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={item.delivery_status}
                    onChange={(e) =>
                      updateItem(index, "delivery_status", e.target.value)
                    }
                  >
                    <option value="complete">Complete</option>
                    <option value="partial">Partial</option>
                    <option value="shortage">Shortage</option>
                  </select>
                </div>

                <div className="flex flex-col flex-1">
                  <Label className="text-xs pl-1">Remarks</Label>
                  <Input
                    placeholder="Optional remarks..."
                    value={item.remarks}
                    onChange={(e) => updateItem(index, "remarks", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Delivery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
