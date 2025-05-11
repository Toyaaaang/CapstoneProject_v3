"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "@/lib/axios";

type Props = {
  request: {
    id: number;
    request_no: string;
    requester: string;
    department: string;
    items: {
      id: number;
      material_name: string;
      unit: string;
      requested_quantity: number;
    }[];
  };
  refreshData: () => void;
};

export default function IssueMaterialsDialog({ request, refreshData }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState(
    request.items.map((item) => ({
      ...item,
      issued_quantity: item.requested_quantity,
      remarks: "",
    }))
  );

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`/warehouse/issue/${request.id}/`, {
        items: items.map((i) => ({
          id: i.id,
          issued_quantity: i.issued_quantity,
          remarks: i.remarks,
        })),
      });
      toast.success("Materials released successfully.");
      setOpen(false);
      refreshData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to issue materials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Release
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Release Materials – {request.request_no}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Requested by: {request.requester} ({request.department})
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {items.map((item, i) => (
              <div
                key={item.id}
                className="border p-3 rounded-md flex flex-wrap gap-2 items-center"
              >
                <div className="w-64">{item.material_name}</div>
                <div className="text-sm text-muted-foreground">
                  Requested: {item.requested_quantity} {item.unit}
                </div>
                <Input
                  className="w-24"
                  type="number"
                  value={item.issued_quantity}
                  min={0}
                  onChange={(e) =>
                    updateItem(i, "issued_quantity", Number(e.target.value))
                  }
                />
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
              {loading ? "Releasing..." : "Confirm Release"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
