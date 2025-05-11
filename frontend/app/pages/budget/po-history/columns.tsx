import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge"; // ShadCN Badge
import { Button } from "@/components/ui/button";
import PreviewDialog from "@/components/dialogs/PreviewDialog"; // For viewing PO details

type PurchaseOrder = {
  supplier: string;
  po_date: string;
  total_amount: number;
  status: "Delivered" | "Undelivered" | "Pending";
};

export const columns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: "supplier",
    header: "Supplier",
    cell: ({ row }) => <div>{row.original.supplier}</div>,
  },
  {
    accessorKey: "po_date",
    header: "PO Date",
    cell: ({ row }) => <div>{row.original.po_date}</div>,
  },
  {
    accessorKey: "total_amount",
    header: "Total Amount",
    cell: ({ row }) => <div>${row.original.total_amount.toFixed(2)}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "Delivered"
            ? "success"
            : row.original.status === "Undelivered"
            ? "destructive"
            : "warning"
        }
        className="py-1 px-2"
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="w-30 flex items-center gap-2">
        {/* View PO Details */}
        <PreviewDialog
          title="Purchase Order Details"
          iframeSrc={`https://example.com/po-preview/${row.original.po_date}`} // Replace with actual URL logic
          triggerText="View Details"
        />

        {/* Download PO */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => console.log(`Downloading PO for ${row.original.supplier}`)}
        >
          Download
        </Button>
      </div>
    ),
  },
];