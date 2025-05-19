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

export const columns: ColumnDef<any>[] = [
  {
    header: "PO No.",
    accessorKey: "po_number",
  },
  {
    header: "Supplier",
    accessorKey: "supplier",
  },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => <Badge>{row.original.status}</Badge>,
  },
  {
    header: "Total",
    accessorKey: "grand_total",
    cell: ({ row }) => `₱${parseFloat(row.original.grand_total).toFixed(2)}`,
  },
  {
    header: "Review",
    cell: ({ row, table }) => {
      const items = row.original.items || [];
      const vatRate = parseFloat(row.original.vat_rate) || 0;
      const vatAmount = parseFloat(row.original.vat_amount) || 0;
      const grandTotal = parseFloat(row.original.grand_total) || 0;
      const subtotal = grandTotal - vatAmount;

      const refresh = table.options.meta?.refreshData;

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">View Details</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[32rem]">
            <div className="mb-2 font-semibold text-sm">PO Items:</div>
            <div className="text-xs max-h-56 overflow-auto space-y-2 pr-1">
              {items.map((item: any, i: number) => (
                <div
                  key={i}
                  className="border rounded-md p-2 text-sm space-y-1"
                >
                  <div className="font-medium">{item.material?.name}</div>
                  <div className="text-muted-foreground">
                    {item.quantity} {item.unit} × ₱{parseFloat(item.unit_price).toFixed(2)}
                  </div>
                  <div className="font-semibold">
                    Total: ₱{parseFloat(item.total).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right mt-4 space-y-1 text-sm">
              <div>Subtotal: ₱{subtotal.toFixed(2)}</div>
              <div>VAT ({vatRate}%): ₱{vatAmount.toFixed(2)}</div>
              <div className="font-bold">Grand Total: ₱{grandTotal.toFixed(2)}</div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    await axios.patch(`/requests/purchase-orders/${row.original.id}/approve/`);
                    toast.success("PO approved.");
                    setTimeout(() => refresh?.(), 200);
                  } catch {
                    toast.error("Failed to approve PO.");
                  }
                }}
              >
                Approve
              </Button>
              <RejectPODialog
                poId={row.original.id}
                refreshData={() => setTimeout(() => refresh?.(), 200)}
              />
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },
];
