import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { PurchaseOrder } from "@/hooks/useGMPOApprovals";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Package } from "lucide-react";

export const columns = (
  handleAction: (id: number, action: "approve" | "reject") => void
): ColumnDef<PurchaseOrder>[] => [
  {
    accessorKey: "reference_no",
    header: "PO No.",
    cell: ({ row }) => <div className="font-medium">{row.original.reference_no}</div>,
  },
  {
    accessorKey: "related_request",
    header: "RV No.",
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
    cell: ({ row }) => (
      <div>
        {row.original.supplier.name}
        <br />
        <span className="text-muted-foreground text-sm">
          {row.original.supplier.address}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "grand_total",
    header: "Total",
    cell: ({ row }) => {
      const total = Number(row.original.grand_total); // 👈 ensure it's a number
      return `₱${total.toFixed(2)}`;
    },
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:underline">
            <Package size={16} />
            View
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 text-sm">
          {row.original.items.map((item, index) => (
            <div key={index} className="mb-1">
              {item.material_name} — {item.quantity} x ₱{item.unit_price} = ₱{item.total_price}
            </div>
          ))}
        </PopoverContent>
      </Popover>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleAction(row.original.id, "approve")}>
          Approve
        </Button>
        <Button variant="destructive" size="sm" onClick={() => handleAction(row.original.id, "reject")}>
          Reject
        </Button>
      </div>
    ),
  },
];
