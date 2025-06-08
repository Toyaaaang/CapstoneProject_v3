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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { XCircle } from "lucide-react";

const REJECTION_REASONS = [
  "Insufficient budget allocation",
  "Unjustified expense",
  "Duplicate entry from another department",
  "Missing cost estimates",
  "Requires further review or documentation",
  "Outside current procurement cycle",
];


interface RejectRVDialogProps {
  rvId: number;
  refreshData: () => void;
}

export function RejectRVDialog({ rvId, refreshData }: RejectRVDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleReject = async () => {
    if (!reason) {
      toast.error("Please select a reason.");
      return;
    }

    try {
      await axios.patch(`/requests/requisition-vouchers/${rvId}/reject/`, {
        rejection_reason: reason,
      });
      toast.success("RV rejected.");
      refreshData();
      setOpen(false);
      setReason("");
    } catch (err) {
      toast.error("Failed to reject RV.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive"><XCircle/>Reject</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reason for Rejecting RV</DialogTitle>
        </DialogHeader>

        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a reason..." />
          </SelectTrigger>
          <SelectContent>
            {REJECTION_REASONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter className="pt-4">
          <Button onClick={handleReject} disabled={!reason}>
            Confirm Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
