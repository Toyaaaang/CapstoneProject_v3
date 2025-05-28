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
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Item = {
  id: number;
  material?: { id: number; name: string } | null;
  custom_name?: string;
  quantity: number;
  unit: string;
};

type Props = {
  requestId: number;
  items: Item[];
  triggerLabel?: string;
  refreshData: () => void;
};

const REJECTION_REASONS = [
  "Insufficient documentation",
  "Incorrect material details",
  "Budget not approved",
  "Duplicate request",
  "Not aligned with project scope",
  "Requires further review",
  "Other",
];

export default function EvaluateDialog({
  requestId,
  items,
  refreshData,
  triggerLabel = "Evaluate",
}: Props) {
  const [open, setOpen] = useState(false);
  const [decisions, setDecisions] = useState<Record<number, "charge" | "requisition">>(() => {
    const defaults: Record<number, "charge" | "requisition"> = {};
    items.forEach((i) => {
      const isCustom = !i.material?.id;
      defaults[i.id] = isCustom ? "requisition" : "charge";
    });
    return defaults;
  });

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleEvaluate = async () => {
    const charge_items = items
      .filter((i) => decisions[i.id] === "charge" && i.material?.id)
      .map((i) => ({
        material_id: i.material!.id,
        quantity: i.quantity,
        unit: i.unit,
      }));

    const requisition_items = items
      .filter((i) => decisions[i.id] === "requisition")
      .map((i) => ({
        material_id: i.material?.id,
        custom_name: i.custom_name,
        custom_unit: i.unit,
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
    if (!rejectionReason) {
      toast.error("Please select a reason.");
      return;
    }
    try {
      await axios.post(`/requests/material-requests/${requestId}/evaluate/`, {
        action: "rejected",
        rejection_reason: rejectionReason,
      });
      toast.success("Request rejected.");
      setOpen(false);
      setRejectDialogOpen(false);
      setRejectionReason("");
      refreshData();
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
          {items.map((item) => {
            const isCustom = !item.material?.id;
            const name = item.material?.name || item.custom_name || "Custom Item";

            return (
              <li
                key={item.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>
                  {name} – {item.quantity} {item.unit}
                  {isCustom && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                      Custom Item
                    </span>
                  )}
                </span>

                {!isCustom ? (
                  <select
                    className="border rounded p-1"
                    value={decisions[item.id]}
                    onChange={(e) =>
                      setDecisions({
                        ...decisions,
                        [item.id]: e.target.value as "charge" | "requisition",
                      })
                    }
                  >
                    <option value="charge">Charge</option>
                    <option value="requisition">Requisition</option>
                  </select>
                ) : (
                  <span className="text-sm text-gray-500 italic">Requisition (Custom)</span>
                )}
              </li>
            );
          })}
        </ul>

        <DialogFooter className="flex justify-between pt-4">
          <div className="space-x-2">
            <Button
              variant="destructive"
              onClick={() => setRejectDialogOpen(true)}
            >
              Reject
            </Button>
            <ConfirmActionDialog
              trigger={
                <Button variant="outline">
                  Mark Invalid
                </Button>
              }
              title="Mark as Invalid?"
              description="Do you want to continue with this action? This cannot be undone."
              confirmLabel="Mark Invalid"
              onConfirm={handleInvalid}
            />
          </div>
          <ConfirmActionDialog
            trigger={
              <Button>
                Submit
              </Button>
            }
            title="Submit Evaluation?"
            description="Do you want to continue with this action? This cannot be undone."
            confirmLabel="Submit"
            onConfirm={handleEvaluate}
          />
        </DialogFooter>
      </DialogContent>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Rejection Reason</DialogTitle>
          </DialogHeader>
          <Select value={rejectionReason} onValueChange={setRejectionReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason..." />
            </SelectTrigger>
            <SelectContent>
              {REJECTION_REASONS.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end pt-4">
            <ConfirmActionDialog
              trigger={
                <Button
                  variant="destructive"
                  disabled={!rejectionReason}
                >
                  Confirm Reject
                </Button>
              }
              title="Reject Request?"
              description="Do you want to continue with this action? This cannot be undone."
              confirmLabel="Reject"
              onConfirm={handleReject}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
