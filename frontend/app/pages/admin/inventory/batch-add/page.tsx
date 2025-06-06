"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import DataTable from "@/components/Tables/DataTable";
import { useAdminInventory } from "@/hooks/admin/useAdminInventory";
import {
  Command, CommandInput, CommandList, CommandItem, CommandEmpty
} from "@/components/ui/command";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function BatchAddInventoryPage() {
  const router = useRouter();
  const { materials, addInventory } = useAdminInventory();
  const [form, setForm] = useState({ material: "", materialName: "", quantity: 0, visible: true });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleAddToList = () => {
    setItems([
      ...items,
      {
        material: form.material,
        materialName: form.materialName,
        quantity: form.quantity,
        visible: form.visible,
      },
    ]);
    setForm({ material: "", materialName: "", quantity: 0, visible: true });
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Submit all items in batch (adjust as needed for your backend)
      for (const item of items) {
        await addInventory(item);
      }
      router.push("/pages/admin/inventory");
    } catch {
      setError("Failed to add inventory.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Material", accessorKey: "materialName" },
    { header: "Quantity", accessorKey: "quantity" },
    { header: "Visible", accessorKey: "visible", cell: ({ row }: any) => (row.original.visible ? "Yes" : "No") },
    {
      header: "",
      id: "actions",
      cell: ({ row }: any) => (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => handleRemoveItem(row.index)}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto p-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Batch Add Inventory</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Add Material Form in a Card */}
          <div className="flex-1 min-w-[260px]">
            <Card>
              <CardHeader>
                <CardTitle>Add Material</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Material Search */}
                <div className="flex flex-col gap-1">
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
                            }}
                          >
                            {mat.name}
                          </CommandItem>
                        ))}
                    </CommandList>
                  </Command>
                </div>
                {/* Quantity & Visible */}
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
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleAddToList}
                  disabled={!form.material || !form.quantity}
                  variant="secondary"
                  className="w-full"
                >
                  Add to List
                </Button>

              </CardFooter>
            </Card>
          </div>
          {/* Right: Items Table */}
          <div className="flex-1 min-w-[320px]">
            <DataTable
              title="Items to Add"
              columns={columns}
              data={items}
              page={1}
              setPage={() => {}}
              totalCount={items.length}
              pageSize={items.length}
            />
            {error && <div className="text-red-500 mt-2">{error}</div>}
                <div className="flex flex-col gap-4 mt-5 w-full">
                  <Button
                    type="submit"
                    disabled={loading || items.length === 0}
                    className="w-full"
                  >
                    {loading ? "Saving..." : "Add All"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/pages/admin/inventory")}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
          </div>
        </div>
      </form>
    </div>
  );
}