"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import { toast } from "sonner";

type Item = {
  id: number;
  material: { id: number; name: string };
  quantity: number;
  unit: string;
};

type Props = {
  requestId: number;
  items: Item[];
  triggerLabel?: string;
  refreshData: () => void;
};

export default function EvaluateDialog({ requestId, items,refreshData, triggerLabel = "Evaluate",  }: Props) {
  const [open, setOpen] = useState(false);
  const [decisions, setDecisions] = useState<Record<number, "charge" | "requisition">>(() => {
    const defaults: Record<number, "charge" | "requisition"> = {};
    items.forEach((i) => (defaults[i.id] = "charge"));
    return defaults;
  });

  const handleEvaluate = async () => {
    const charge_items = items
      .filter((i) => decisions[i.id] === "charge")
      .map((i) => ({
        material_id: i.material.id,
        quantity: i.quantity,
        unit: i.unit,
      }));

    const requisition_items = items
      .filter((i) => decisions[i.id] === "requisition")
      .map((i) => ({
        material_id: i.material.id,
        quantity: i.quantity,
        unit: i.unit,
      }));

    try {
      await axios.post(`/requests/material-requests/${requestId}/evaluate/`, {
        action: "evaluate",
        charge_items,
        requisition_items,
      });
      toast.success("Request evaluated.");
      refreshData();
      setOpen(false);
    } catch {
      toast.error("Failed to evaluate.");
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(`/requests/material-requests/${requestId}/evaluate/`, {
        action: "reject",
      });
      toast.success("Request rejected.");
      setOpen(false);
    } catch {
      toast.error("Failed to reject.");
    }
  };

  const handleInvalid = async () => {
    try {
      await axios.post(`/requests/material-requests/${requestId}/evaluate/`, {
        action: "invalid",
      });
      toast.success("Marked as invalid.");
      setOpen(false);
    } catch {
      toast.error("Failed to mark invalid.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Evaluate Request</DialogTitle>
        </DialogHeader>

        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between items-center border p-2 rounded">
              <span>
                {item.material?.name} – {item.quantity} {item.unit}
              </span>
              <select
                className="border rounded p-1"
                value={decisions[item.id]}
                onChange={(e) =>
                  setDecisions({ ...decisions, [item.id]: e.target.value as "charge" | "requisition" })
                }
              >
                <option value="charge">Charge</option>
                <option value="requisition">Requisition</option>
              </select>
            </li>
          ))}
        </ul>

        <DialogFooter className="flex justify-between pt-4">
          <div className="space-x-2">
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
            <Button variant="outline" onClick={handleInvalid}>
              Mark Invalid
            </Button>
          </div>
          <Button onClick={handleEvaluate}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
