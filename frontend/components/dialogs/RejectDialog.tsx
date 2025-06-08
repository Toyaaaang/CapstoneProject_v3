"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { X } from "lucide-react";

const REJECTION_REASONS = [
  "Incomplete request details",
  "Insufficient stock",
  "Invalid purpose",
  "Not aligned with current priorities",
  "Duplicate request",
  "Missing approvals or documents",
];

export function RejectDialog({
  ticketId,
  itemId,
  refreshData,
}: {
  ticketId: number;
  itemId?: number;
  refreshData: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleReject = async () => {
    if (!reason) {
      toast.error("Please select a reason.");
      return;
    }

    try {
      const url = itemId
        ? `/requests/charge-tickets/${ticketId}/items/${itemId}/reject/`
        : `/requests/charge-tickets/${ticketId}/reject/`;
      await axios.post(url, { reason });
      toast.success(itemId ? "Item rejected." : "Charge Ticket rejected.");
      refreshData();
      setOpen(false);
    } catch (err) {
      toast.error("Failed to reject.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive"><X/> Reject</Button>
      </DialogTrigger>
      <DialogContent className="select-none">
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
          <Button className="w-full" onClick={handleReject} disabled={!reason}>
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
