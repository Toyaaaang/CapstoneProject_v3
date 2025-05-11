"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function CreditReturnForm() {
  const [date, setDate] = useState("");
  const [materials, setMaterials] = useState([
    { id: "", name: "", unit: "", quantity: 1, remarks: "" },
  ]);

  const handleMaterialChange = (index: number, field: string, value: any) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  const addMaterial = () => {
    setMaterials([...materials, { id: "", name: "", unit: "", quantity: 1, remarks: "" }]);
  };

  const removeMaterial = (index: number) => {
    const updated = [...materials];
    updated.splice(index, 1);
    setMaterials(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // send { date, materials } to backend
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">Credit Return Form</h2>

      {/* Date */}
      <div>
        <Label>Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Materials */}
      <div className="space-y-2">
        <Label>Materials</Label>
        {materials.map((mat, idx) => (
          <div
            key={idx}
            className="flex flex-wrap gap-2 items-center border p-3 rounded"
          >
            <Input
              placeholder="Material Name"
              value={mat.name}
              onChange={(e) =>
                handleMaterialChange(idx, "name", e.target.value)
              }
              className="w-48"
            />
            <Input
              placeholder="Unit"
              value={mat.unit}
              onChange={(e) =>
                handleMaterialChange(idx, "unit", e.target.value)
              }
              className="w-24"
            />
            <Input
              type="number"
              placeholder="Quantity"
              min={1}
              value={mat.quantity}
              onChange={(e) =>
                handleMaterialChange(idx, "quantity", Number(e.target.value))
              }
              className="w-24"
            />
            <Textarea
              placeholder="Remarks"
              value={mat.remarks}
              onChange={(e) =>
                handleMaterialChange(idx, "remarks", e.target.value)
              }
              className="flex-1 min-w-[200px]"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeMaterial(idx)}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addMaterial}>
          + Add Material
        </Button>
      </div>

      <Button type="submit" className="w-full" onClick={handleSubmit}>
        Submit Credit Return
      </Button>
    </Card>
  );
}
