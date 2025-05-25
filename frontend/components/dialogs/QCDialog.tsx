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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import axios from "@/lib/axios";

const QC_REMARKS = [
  "Satisfactory",
  "Damaged Packaging",
  "Incorrect Item",
  "Requires Certification",
  "No Issues Found",
  "Pending Further Inspection",
];

export default function QualityCheckDialog({
  po,
  refreshData,
}: {
  po: any;
  refreshData: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(
    po.items.map((item: any) => ({
      po_item_id: item.id,
      requires_certification: false,
      remarks: "",
      material_name: item.material?.name || item.custom_name || "Custom Item",
      quantity: item.quantity,
      unit: item.unit,
    }))
  );

  const handleCheckboxChange = (index: number, value: boolean) => {
    const updated = [...items];
    updated[index].requires_certification = value;
    setItems(updated);
  };

  const handleRemarksChange = (index: number, value: string) => {
    const updated = [...items];
    updated[index].remarks = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post("/requests/quality-checks/", {
        purchase_order_id: po.id,
        items: items.map((i) => ({
          po_item_id: i.po_item_id,
          requires_certification: i.requires_certification,
          remarks: i.remarks,
        })),
      });
      toast.success("Quality Check submitted");
      setOpen(false);
      refreshData();
    } catch (err) {
      toast.error("Failed to submit QC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Submit QC</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Quality Check for <span className="text-primary">{po.po_number}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {items.map((item, i) => (
            <div
              key={i}
              className="border rounded-md p-4 bg-muted/30 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold truncate">{item.material_name}</div>
                <div className="text-xs text-muted-foreground">
                  Qty: <span className="font-medium">{item.quantity}</span> {item.unit}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={item.requires_certification}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(i, !!checked)
                  }
                  id={`cert-${i}`}
                />
                <Label htmlFor={`cert-${i}`}>Requires Certification</Label>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Remarks</Label>
                <Select
                  value={item.remarks}
                  onValueChange={(value) => handleRemarksChange(i, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a remark" />
                  </SelectTrigger>
                  <SelectContent>
                    {QC_REMARKS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit QC"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
