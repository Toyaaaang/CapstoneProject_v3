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

const REJECTION_REASONS = [
  "Insufficient documentation",
  "Incorrect material details",
  "Budget not approved",
  "Duplicate request",
  "Not aligned with project scope",
  "Requires further review",
  "Other",
];

interface RejectEvaluationDialogProps {
  evaluationId: number;
  refreshData: () => void;
}

export function RejectEvaluationDialog({ evaluationId, refreshData }: RejectEvaluationDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleReject = async () => {
    if (!reason) {
      toast.error("Please select a reason.");
      return;
    }

    try {
      await axios.patch(`/requests/evaluations/${evaluationId}/reject/`, {
        rejection_reason: reason,
      });
      toast.success("Evaluation rejected.");
      refreshData();
      setOpen(false);
      setReason("");
    } catch (err) {
      toast.error("Failed to reject evaluation.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">Reject Evaluation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reason for Rejecting Evaluation</DialogTitle>
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