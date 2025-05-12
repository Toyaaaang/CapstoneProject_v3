"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "@/lib/axios";
import { toast } from "sonner";

type CreateReturnDialogProps = {
  po: {
    id: number;
    po_no: string;
    supplier: string;
    department: string;
    failed_items: {
      material_id: number;
      material_name: string;
      unit: string;
      quantity: number;
      qc_remarks?: string;
    }[];
  };
  refreshData: () => void;
};

export default function CreateReturnDialog({ po, refreshData }: CreateReturnDialogProps) {
  const [open, setOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post("/warehouse/purchase-return/create/", {
        po_id: po.id,
        items: po.failed_items.map((item) => ({
          material_id: item.material_id,
          quantity: item.quantity,
          unit: item.unit,
        })),
        remarks,
      });
      toast.success("Purchase return created");
      setOpen(false);
      refreshData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create return");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Create Return</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Return – PO #{po.po_no}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Supplier: {po.supplier} | Department: {po.department}
            </p>
          </DialogHeader>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Failed Materials:</h4>
            <ul className="text-sm space-y-1 bg-muted p-3 rounded-md">
              {po.failed_items.map((item, i) => (
                <li key={i}>
                  • {item.material_name} – {item.quantity} {item.unit}
                  {item.qc_remarks && (
                    <div className="text-xs italic text-muted-foreground ml-4">
                      Note: {item.qc_remarks}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <Textarea
              placeholder="Optional remarks about this return..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Confirm Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
