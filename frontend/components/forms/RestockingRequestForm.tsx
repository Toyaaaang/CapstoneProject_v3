"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import useRestockingRequest from "@/hooks/engineering/useRestockingRequest";

export default function RestockingRequestForm() {
  const {
    items,
    handleAddItem,
    handleRemoveItem,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  } = useRestockingRequest();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit("RV-0001", "Restocking materials for warehouse."); // Adjust reference_no as needed
  };

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Requisition Voucher</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              {/* Item Name */}
              <Input
                placeholder="Item Name"
                value={item.item_name}
                onChange={(e) => handleChange(index, "item_name", e.target.value)}
                className="flex-1"
              />

              {/* Quantity Requested */}
              <Input
                type="number"
                placeholder="Quantity"
                value={item.quantity_requested}
                onChange={(e) => handleChange(index, "quantity_requested", e.target.value)}
                className="w-24"
              />

              {/* Unit */}
              <Select
                value={item.unit}
                onValueChange={(value) => handleChange(index, "unit", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="liters">liters</SelectItem>
                  <SelectItem value="meters">meters</SelectItem>
                  <SelectItem value="boxes">boxes</SelectItem>
                  <SelectItem value="packs">packs</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              {/* Remove Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length === 1}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}

          {/* Add Item Button */}
          <Button type="button" onClick={handleAddItem} disabled={items.length >= 10}>
            <Plus size={16} className="mr-2" />
            Add more
          </Button>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
