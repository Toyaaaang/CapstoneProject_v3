// components/Dialog/QCDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQCDialog } from "@/hooks/useQCDialog";

interface QCDialogProps {
  dialog: ReturnType<typeof useQCDialog>;
  onSuccess: () => void;
}

export default function QCDialog({ dialog, onSuccess }: QCDialogProps) {
  const {
    isOpen,
    record,
    items,
    overallStatus,
    remarks,
    setOverallStatus,
    setRemarks,
    closeDialog,
    updateItemStatus,
    updateItemNotes,
    submit,
  } = dialog;

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Quality Check – {record?.purchase_order.reference_no}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 items-end">
              <div>
                <p>{it.material_name}</p>
              </div>
              <Select
                value={it.status}
                onValueChange={(v) => updateItemStatus(i, v as typeof it.status)}
              >
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
                <SelectItem value="needs_cert">Needs Cert</SelectItem>
              </Select>
              <Input
                placeholder="Notes"
                value={it.notes}
                onChange={(e) => updateItemNotes(i, e.target.value)}
              />
            </div>
          ))}

          <div>
            <p className="font-medium">Overall Status</p>
            <Select
              value={overallStatus}
              onValueChange={(v) => setOverallStatus(v as typeof overallStatus)}
            >
              <SelectItem value="pass">Pass</SelectItem>
              <SelectItem value="fail">Fail</SelectItem>
              <SelectItem value="needs_cert">Needs Cert</SelectItem>
            </Select>
          </div>

          <div>
            <p className="font-medium">Remarks</p>
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
          <Button onClick={() => submit(onSuccess)}>Submit QC</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
