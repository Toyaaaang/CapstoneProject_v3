"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import { toast } from "sonner";

type Material = {
  id: number;
  name: string;
  unit: string;
};

type Item = {
  material_id?: number;
  quantity: number;
  unit: string;
  remarks?: string;
};

export default function RVRequestForm() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    axios.get("/inventory/available/").then((res) => {
      setMaterials(res.data);
    });
  }, []);

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === "material_id") {
      const selected = materials.find((m) => m.id === value);
      if (selected) updated[index].unit = selected.unit;
    }

    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { quantity: 1, unit: "" }]);
  };

  const removeItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("/requests/requisition-voucher/", {
        purpose,
        items,
      });

      toast.success("Requisition submitted successfully.");
      setPurpose("");
      setItems([]);
    } catch (err) {
      toast.error("Submission failed. Please check your input.");
    }
  };

  return (
    <Card className="w-full p-6 space-y-6">
      <h1 className="text-xl font-bold">Departmental Requisition Request</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="p-2">Purpose</Label>
          <Textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="p-2">Materials</Label>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-wrap gap-2 items-center border p-3 rounded"
            >
              <select
                value={item.material_id ?? ""}
                onChange={(e) =>
                  updateItem(i, "material_id", Number(e.target.value))
                }
                className="w-60 border rounded px-2 py-1"
              >
                <option value="" disabled>
                  Select material
                </option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                min={1}
                className="w-24"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(i, "quantity", Number(e.target.value))
                }
              />

              <Input
                className="w-24"
                placeholder="Unit"
                disabled
                value={item.unit}
              />

              <Input
                className="w-64"
                placeholder="Remarks (optional)"
                value={item.remarks || ""}
                onChange={(e) =>
                  updateItem(i, "remarks", e.target.value)
                }
              />

              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeItem(i)}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addItem}>
            + Add Material
          </Button>
        </div>

        <Button type="submit" className="w-full">
          Submit Request
        </Button>
      </form>
    </Card>
  );
}
