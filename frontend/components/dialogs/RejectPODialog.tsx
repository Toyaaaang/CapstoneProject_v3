// app/components/dialogs/RejectPODialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import axios from "@/lib/axios";

const REJECTION_REASONS = [
  "Incorrect supplier information",
  "Missing item price",
  "PO not justified",
  "Budget constraints",
  "Incomplete details",
];

export function RejectPODialog({ poId, refreshData }: { poId: number; refreshData: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleReject = async () => {
  if (!reason) {
    toast.error("Please select a rejection reason.");
    return;
  }

  try {
    await axios.patch(`/requests/purchase-orders/${poId}/reject/`, {
      rejection_reason: reason,
    });
    toast.success("PO rejected.");

    // ✅ Store refreshData in local scope to avoid undefined error later
    const runRefresh = refreshData;

    setOpen(false);

    setTimeout(() => {
      runRefresh?.(); // Safely call it
    }, 200);
  } catch (err) {
    toast.error("Failed to reject PO.");
  }
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">Reject</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Rejection Reason</DialogTitle>
        </DialogHeader>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose reason..." />
          </SelectTrigger>
          <SelectContent>
            {REJECTION_REASONS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter className="pt-4">
          <Button onClick={handleReject} disabled={!reason}>Confirm Rejection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
