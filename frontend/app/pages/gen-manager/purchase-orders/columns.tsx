import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { RejectPODialog } from "@/components/dialogs/RejectPODialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import { useRouter } from "next/navigation";

// Helper to fetch estimates for a PO's items
async function fetchEstimates(items: any[]) {
  if (!items?.length) return {};
  const res = await axios.post("/requests/purchase-orders/estimate/", {
    items: items
      .filter((item: any) => item.material?.id)
      .map((item: any) => ({
        material_id: item.material.id,
        unit: item.unit,
      })),
  });
  return res.data;
}

export const columns: ColumnDef<any>[] = [
  {
    header: "PO No.",
    accessorKey: "po_number",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue()}</span>
    ),
  },
  {
    header: "Supplier",
    accessorKey: "supplier",
    cell: ({ row }) => {
      const supplier = row.original.supplier_name || row.original.supplier;
      return (
        <span className="font-semibold">
          {supplier
            ? supplier.charAt(0).toUpperCase() + supplier.slice(1)
            : <span className="italic text-muted-foreground">N/A</span>}
        </span>
      );
    },
  },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = row.original.created_at ? new Date(row.original.created_at) : null;
      return date
        ? date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge>
        {row.original.status
          ? row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)
          : ""}
      </Badge>
    ),
  },
  {
    id: "estimatedAmount",
    header: (
      <>
        Estimated Amount
        <br />
        <span className="text-xs text-gray-800 dark:text-gray-400">(Historical Avg + VAT)</span>
      </>
    ) as any,
    cell: ({ row }) => {
      const [estimate, setEstimate] = React.useState<number | null>(null);

      React.useEffect(() => {
        let mounted = true;
        fetchEstimates(row.original.items).then((estimates) => {
          if (!mounted) return;
          let total = 0;
          row.original.items.forEach((item: any) => {
            const est = estimates[item.material?.id];
            if (est && est.average) {
              total += est.average * item.quantity;
            }
          });
          setEstimate(total || null);
        });
        return () => { mounted = false; };
      }, [row.original.items]);

      const vatRate = parseFloat(row.original.vat_rate) || 0;
      const estimateWithVat = estimate !== null ? estimate * (1 + vatRate / 100) : null;

      return estimateWithVat !== null
        ? <span className="font-mono text-blue-700 dark:text-blue-400">₱{estimateWithVat.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
        : <span className="italic text-gray-800 dark:text-gray-400">No estimate</span>;
    },
    meta: { align: "right" },
  },
  {
    header: "Actual Amount",
    accessorKey: "grand_total",
    cell: ({ row }) => (
      <span className="font-mono font-semibold">
        ₱
        {parseFloat(row.original.grand_total).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    ),
    meta: { align: "right" },
  },
  {
    id: "variance",
    header: (
      <>
        Variance
        <br />
        <span className="text-xs text-gray-800 dark:text-gray-400">(Actual - Estimate)</span>
      </>
    ) as any,
    cell: ({ row }) => {
      const [estimate, setEstimate] = React.useState<number | null>(null);

      React.useEffect(() => {
        let mounted = true;
        fetchEstimates(row.original.items).then((estimates) => {
          if (!mounted) return;
          let total = 0;
          row.original.items.forEach((item: any) => {
            const est = estimates[item.material?.id];
            if (est && est.average) {
              total += est.average * item.quantity;
            }
          });
          setEstimate(total || null);
        });
        return () => { mounted = false; };
      }, [row.original.items]);

      const actual = parseFloat(row.original.grand_total);
      const vatRate = parseFloat(row.original.vat_rate) || 0;
      const estimateWithVat = estimate !== null ? estimate * (1 + vatRate / 100) : null;

      return estimateWithVat !== null
        ? (
          <span className={`font-mono ${actual - estimateWithVat > 0 ? "text-red-600" : "text-green-600"}`}>
            ₱{(actual - estimateWithVat).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </span>
        )
        : <span className="italic text-gray-800 dark:text-gray-400">N/A</span>;
    },
    meta: { align: "right" },
  },
  {
    header: "Review",
    cell: ({ row }) => {
      const items = row.original.items || [];
      const vatRate = parseFloat(row.original.vat_rate) || 0;
      const vatAmount = parseFloat(row.original.vat_amount) || 0;
      const grandTotal = parseFloat(row.original.grand_total) || 0;
      const subtotal = grandTotal - vatAmount;

      const [open, setOpen] = React.useState(false);
      const previewItems = items.slice(0, 5); // Only first 5 items
      const router = useRouter();

      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">View Details</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[32rem]">
            <div className="grid grid-cols-4 gap-2 font-semibold text-xs mb-2 px-1">
              <span>Material</span>
              <span className="text-center">Qty</span>
              <span className="text-center">Unit Price</span>
              <span className="text-right">Total</span>
            </div>
            <div className="max-h-56 overflow-auto flex flex-col gap-2 pr-1">
              {previewItems.map((item: any, i: number) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                >
                  <div className="font-medium truncate">
                    {item.material?.name || item.custom_name || "Unknown Item"}
                  </div>
                  <div className="text-center text-muted-foreground">
                    {item.quantity}
                  </div>
                  <div className="text-center text-muted-foreground">
                    ₱{parseFloat(item.unit_price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-right font-semibold">
                    ₱{parseFloat(item.total).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
              {items.length > 5 && (
                <div className="text-xs text-muted-foreground text-center mt-2">
                  ...and {items.length - 5} more items
                </div>
              )}
            </div>

            <div className="text-right mt-4 space-y-1 text-sm">
              <div>Subtotal: ₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
              <div>VAT ({vatRate}%): ₱{vatAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
              <div className="font-bold">Grand Total: ₱{grandTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-blue-700 dark:text-blue-400 flex justify-center w-full"
              onClick={() => {
                setOpen(false);
                router.push(`/pages/gen-manager/purchase-orders/${row.original.id}/items`);
              }}
            >
              Show Full Details
            </Button>
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    header: "Action",
    cell: ({ row, table }) => {
      const refresh = table.options.meta?.refreshData;
      const [loading, setLoading] = React.useState(false);

      const handleApprove = async () => {
        setLoading(true);
        try {
          await axios.patch(`/requests/purchase-orders/${row.original.id}/approve/`);
          toast.success("PO approved.");
          setTimeout(() => refresh?.(), 200);
        } catch {
          toast.error("Failed to approve PO.");
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="flex gap-2">
          <ConfirmActionDialog
            trigger={
              <Button size="sm" disabled={loading}>
                Approve
              </Button>
            }
            title="Approve Purchase Order?"
            description="Do you want to continue with this action? This cannot be undone."
            confirmLabel="Approve"
            cancelLabel="Cancel"
            onConfirm={handleApprove}
            loading={loading}
          />
          <RejectPODialog
            poId={row.original.id}
            refreshData={() => setTimeout(() => refresh?.(), 200)}
          />
        </div>
      );
    },
  },
];
