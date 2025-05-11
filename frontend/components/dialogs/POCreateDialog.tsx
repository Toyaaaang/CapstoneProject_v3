"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePurchaseOrderForm } from "@/hooks/usePurchaseOrderForm";

export function POCreateDialog({ hook }: { hook: ReturnType<typeof usePurchaseOrderForm> }) {
  const {
    open,
    setOpen,
    supplier,
    setSupplier,
    materials,
    updateUnitPrice,
    grandTotal,
    handleSubmit,
    loading,
  } = hook;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Issue Purchase Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Supplier Name"
              value={supplier.name}
              onChange={(e) => setSupplier({ ...supplier, name: e.target.value })}
            />
            <Input
              placeholder="Supplier Address"
              value={supplier.address}
              onChange={(e) => setSupplier({ ...supplier, address: e.target.value })}
            />
          </div>

          <div className="border p-2 rounded-md max-h-64 overflow-y-auto">
            {materials.map((mat, i) => (
              <div key={i} className="flex items-center justify-between gap-2 mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{mat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {mat.quantity} {mat.unit}
                  </p>
                </div>
                <Input
                  type="number"
                  placeholder="₱ Unit Price"
                  value={mat.unit_price}
                  onChange={(e) => updateUnitPrice(i, e.target.value)}
                  className="w-32"
                />
              </div>
            ))}
          </div>

          <div className="text-right text-sm font-medium">Grand Total: ₱{grandTotal.toFixed(2)}</div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Submit Purchase Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
