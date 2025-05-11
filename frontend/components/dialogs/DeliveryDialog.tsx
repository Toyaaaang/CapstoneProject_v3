// components/Dialog/DeliveryDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDeliveryDialog } from "@/hooks/useDeliveryDialog";

interface DeliveryDialogProps {
  dialog: ReturnType<typeof useDeliveryDialog>;
  onSuccess: () => void;
}

export default function DeliveryDialog({
  dialog,
  onSuccess,
}: DeliveryDialogProps) {
  const {
    isOpen,
    po,
    items,
    remarks,
    setRemarks,
    closeDialog,
    updateDelivered,
    updateNotes,
    submit,
  } = dialog;

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Validate Delivery {po?.reference_no}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 items-center">
              <div>
                <p className="font-medium">{it.material_name}</p>
                <p className="text-sm text-muted-foreground">
                  Expected: {it.quantity}
                </p>
              </div>
              <Input
                type="number"
                value={it.delivered_quantity}
                onChange={(e) =>
                  updateDelivered(i, parseFloat(e.target.value))
                }
                min={0}
                step={0.01}
              />
              <Input
                placeholder="Notes"
                value={it.notes}
                onChange={(e) => updateNotes(i, e.target.value)}
              />
            </div>
          ))}

          <div>
            <p className="font-medium">Overall Remarks</p>
            <Input
              placeholder="Optional remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={closeDialog}>
            Cancel
          </Button>
          <Button onClick={() => submit(onSuccess)}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
