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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";

type CreatePODialogProps = {
  rv: {
    id: number;
    rv_number: string;
    department: string;
    requester?: {
      first_name?: string;
      last_name?: string;
    };
    created_at: string;
    items?: {
      id: number;
      material?: {
        id: number;
        name: string;
      } | null;
      custom_name?: string;
      quantity: number;
      unit: string;
    }[];
  };
  refreshData: () => void;
};

export default function CreatePODialog({ rv, refreshData }: CreatePODialogProps) {
  if (!rv?.id || !rv.items) return null;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [vatRate, setVatRate] = useState(12);

  const [items, setItems] = useState(() =>
    rv.items!.map((item) => ({
      material_id: item.material?.id ?? null,
      material_name: item.material?.name || item.custom_name || "Custom Item",
      quantity: item.quantity,
      unit: item.unit,
      unit_price: 0,
      total_price: 0,
    }))
  );

  const updateItem = (index: number, value: number) => {
    const updated = [...items];
    updated[index].unit_price = value;
    updated[index].total_price = value * updated[index].quantity;
    setItems(updated);
  };

  const round = (num: number) => Math.round(num * 100) / 100;

  const subtotal = items.reduce((sum, i) => sum + i.total_price, 0);
  const vatAmount = round(subtotal * (vatRate / 100));
  const grandTotal = round(subtotal + vatAmount);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);

  const isFormValid =
    supplierName.trim() !== "" &&
    supplierAddress.trim() !== "" &&
    items.every((item) => item.unit_price > 0);

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error("Please complete all required fields and unit prices.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/requests/purchase-orders/", {
        rv_id: rv.id,
        supplier: supplierName,
        supplier_address: supplierAddress,
        vat_rate: vatRate,
        items: items.map((i) => {
          if (i.material_id) {
            return {
              material_id: i.material_id,
              quantity: i.quantity,
              unit: i.unit,
              unit_price: i.unit_price,
            };
          } else {
            return {
              custom_name: i.material_name,
              custom_unit: i.unit,
              quantity: i.quantity,
              unit: i.unit,
              unit_price: i.unit_price,
            };
          }
        }),
      });
      toast.success("Purchase Order created.");
      setOpen(false);
      refreshData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create PO.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Create PO
      </Button>
      <Dialog open={open} onOpenChange={(state) => !loading && setOpen(state)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Order for {rv.rv_number}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Department: {rv.department?.charAt(0).toUpperCase() + rv.department?.slice(1)} | Requested By:{" "}
              {rv.requester?.first_name || "N/A"} {rv.requester?.last_name || ""}
            </p>
          </DialogHeader>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="pl-1">Supplier Name</Label>
              <Input
                placeholder="e.g. ABC Trading"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="pl-1">Supplier Address</Label>
              <Input
                placeholder="e.g. Brgy. Sampaloc, Lucena"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-4 gap-4 px-2 py-2 font-semibold text-sm border-b">
              <div>Material</div>
              <div>Quantity</div>
              <div>
                Unit Price <span className="text-muted-foreground text-xs">(PHP)</span>
              </div>
              <div>Total</div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 mt-2 pr-1">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-4 items-center border rounded-md px-2 py-2"
                >
                  <div className="text-sm font-medium">{item.material_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit}
                  </div>
                  <Input
                    type="number"
                    className="w-full"
                    min={0}
                    step="0.01"
                    placeholder="Unit Price"
                    value={item.unit_price}
                    onChange={(e) => updateItem(i, parseFloat(e.target.value) || 0)}
                  />
                  <div className="text-sm font-semibold">
                    {formatCurrency(item.total_price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-right space-y-2 mt-6">
            <div className="flex justify-end gap-2 items-center">
              <Label className="pl-1 text-sm">VAT (%)</Label>
              <Input
                type="number"
                className="w-24"
                min={0}
                step={0.1}
                value={vatRate}
                onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="text-sm">Subtotal: {formatCurrency(subtotal)}</div>
            <div className="text-sm">VAT ({vatRate}%): {formatCurrency(vatAmount)}</div>
            <div className="text-lg font-bold">
              Grand Total: {formatCurrency(grandTotal)}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <ConfirmActionDialog
              trigger={
                <Button disabled={loading || !isFormValid}>
                  {loading ? "Creating..." : "Submit PO"}
                </Button>
              }
              title="Create Purchase Order?"
              description="Do you want to continue with this action? This cannot be undone."
              confirmLabel="Submit"
              cancelLabel="Cancel"
              onConfirm={handleSubmit}
              loading={loading}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
