"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";

export default function AddInventoryDialog({
  materials,
  onAdd,
}: {
  materials: any[];
  onAdd: (item: any) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [form, setForm] = useState({ material: "", materialName: "", quantity: 0, visible: true });
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
      await onAdd({ material: form.material, quantity: form.quantity, visible: form.visible });
      setOpen(false);
      setForm({ material: "", materialName: "", quantity: 0, visible: true });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="material">Material</label>
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
                      }}
                    >
                      {mat.name}
                    </CommandItem>
                  ))}
              </CommandList>
            </Command>
          </div>
          <div>
            <label htmlFor="quantity">Quantity</label>
            <Input
              id="quantity"
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={e => handleChange("quantity", e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={e => handleChange("visible", e.target.checked)}
              id="visible"
            />
            <label htmlFor="visible">Visible</label>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || !form.material}
            >
              {loading ? "Saving..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}