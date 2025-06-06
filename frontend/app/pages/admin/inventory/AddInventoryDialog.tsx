"use client";

import { useState } from "react";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command, CommandInput, CommandList, CommandItem, CommandEmpty
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function AddInventoryDialog({
  materials,
  onAdd,
}: {
  materials: any[];
  onAdd: (item: any) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    material: "",
    materialName: "",
    quantity: 0,
    visible: true,
    unit: "pcs", // <-- add this
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onAdd(form);
      setOpen(false);
      setForm({ material: "", materialName: "", quantity: 0, visible: true, unit: "" });
    } catch {
      setError("Failed to add inventory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">+ Add Inventory</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="mb-4">Add Inventory Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-1 mb-4">
            <Label htmlFor="material">Material</Label>
            <Command>
              <CommandInput
                placeholder="Search material..."
                value={form.materialName}
                onValueChange={val => handleChange("materialName", val)}
              />
              <CommandList>
                <CommandEmpty>No material found.</CommandEmpty>
                {materials
                  .filter(mat =>
                    mat.name.toLowerCase().includes(form.materialName.toLowerCase())
                  )
                  .map(mat => (
                    <CommandItem
                      key={mat.id}
                      value={mat.name}
                      onSelect={() => {
                        handleChange("material", mat.id);
                        handleChange("materialName", mat.name);
                        handleChange("unit", mat.unit);
                      }}
                    >
                      {mat.name}
                    </CommandItem>
                  ))}
              </CommandList>
            </Command>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-1">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                placeholder="Quantity"
                value={form.quantity}
                onChange={e => handleChange("quantity", Number(e.target.value))}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="visible">Visible</Label>
              <div className="flex items-center gap-2 h-10">
                <Checkbox
                  id="visible"
                  checked={form.visible}
                  onCheckedChange={val => handleChange("visible", !!val)}
                />
                <span className="text-sm">Visible</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              value={form.unit}
              disabled
              readOnly
              className="bg-muted cursor-not-allowed"
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || !form.material || !form.quantity}
              className="w-full"
            >
              {loading ? "Saving..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}