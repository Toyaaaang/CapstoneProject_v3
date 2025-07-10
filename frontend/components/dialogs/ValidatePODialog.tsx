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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "@/lib/axios";

type MaterialItem = {
  id: number;
  material_name: string;
  unit: string;
  ordered_quantity: number;
};

type POProps = {
  po: {
    id: number;
    po_no: string;
    supplier: string;
    department: string;
    delivery_date: string;
    items: MaterialItem[];
  };
  refreshData: () => void;
};

export default function ValidatePODialog({ po, refreshData }: POProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState(
    po.items.map((item) => ({
      ...item,
      delivered_quantity: item.ordered_quantity,
      status: "complete",
      remarks: "",
    }))
  );

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`/warehouse/validate-po/${po.id}/`, {
        items: materials.map((m) => ({
          id: m.id,
          delivered_quantity: m.delivered_quantity,
          status: m.status,
          remarks: m.remarks,
        })),
      });
      toast.success("PO validated successfully.");
      setOpen(false);
      refreshData(); // 🔄 refresh table
    } catch (err) {
      console.error(err);
      toast.error("Failed to validate delivery.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Validate
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Validate PO – {po.po_no}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Supplier: {po.supplier} | Department: {po.department}
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {materials.map((item, i) => (
              <div
                key={item.id}
                className="border p-3 rounded-md flex flex-wrap gap-2 items-center"
              >
                <div className="w-64">{item.material_name}</div>
                <div className="w-24 text-sm text-muted-foreground">
                  Ordered: {item.ordered_quantity} {item.unit}
                </div>
                <Input
                  className="w-24"
                  type="number"
                  value={item.delivered_quantity}
                  min={0}
                  onChange={(e) =>
                    updateItem(i, "delivered_quantity", Number(e.target.value))
                  }
                />
                <Select
                  value={item.status}
                  onValueChange={(val) => updateItem(i, "status", val)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complete">✅ Complete</SelectItem>
                    <SelectItem value="partial">⚠️ Partial</SelectItem>
                    <SelectItem value="shortage">❌ Shortage</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  className="min-w-[200px] w-full"
                  placeholder="Remarks (optional)"
                  value={item.remarks}
                  onChange={(e) => updateItem(i, "remarks", e.target.value)}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Submit Validation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
