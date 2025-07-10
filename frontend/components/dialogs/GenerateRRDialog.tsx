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
import { toast } from "sonner";
import axios from "@/lib/axios";

type POProps = {
  po: {
    id: number;
    po_no: string;
    supplier: string;
    department: string;
    delivery_date: string;
    items: {
      material_name: string;
      unit: string;
      certified_quantity: number;
    }[];
  };
  refreshData: () => void;
};

export default function GenerateRRDialog({ po, refreshData }: POProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await axios.post(`/warehouse/receiving-report/generate/`, {
        po_id: po.id,
      });
      toast.success("Receiving Report generated successfully.");
      setOpen(false);
      refreshData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate RR.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Generate RR</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Receiving Report – {po.po_no}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Supplier: {po.supplier} | Department: {po.department}
            </p>
          </DialogHeader>

          <div className="space-y-2">
            <h4 className="font-semibold">Materials Certified:</h4>
            <ul className="text-sm space-y-1">
              {po.items.map((item, i) => (
                <li key={i}>
                  • {item.material_name} – {item.certified_quantity} {item.unit}
                </li>
              ))}
            </ul>
          </div>

          <DialogFooter>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating..." : "Confirm & Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
