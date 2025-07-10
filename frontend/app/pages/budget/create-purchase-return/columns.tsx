import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import CreateReturnDialog from "@/components/dialogs/CreateReturnDialog";

export type POWithFailedQC = {
    id: number;
    po_no: string;
    supplier: string;
    department: string;
    delivery_date: string;
    failed_items: {
      material_id: number;
      material_name: string;
      quantity: number;
      unit: string;
      qc_remarks?: string;
    }[];
  };
  
export const columns = ({
  refreshData,
}: {
  refreshData: () => void;
}): ColumnDef<POWithFailedQC>[] => [
  {
    header: "PO No.",
    accessorKey: "po_no",
    cell: ({ row }) => <span className="font-mono">{row.original.po_no}</span>,
  },
  {
    header: "Supplier",
    accessorKey: "supplier",
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) =>
      row.original.department.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    header: "Delivery Date",
    accessorKey: "delivery_date",
    cell: ({ row }) => {
      const date = new Date(row.original.delivery_date);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    header: "Failed Items",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">View</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <ul className="text-sm space-y-1 py-2">
            {row.original.failed_items.map((item, i) => (
              <li key={i}>
                {item.material_name} – {item.quantity} {item.unit}
                {item.qc_remarks && (
                  <div className="text-xs text-muted-foreground italic">
                    {item.qc_remarks}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    header: "Action",
    cell: ({ row }) => (
      <CreateReturnDialog po={row.original} refreshData={refreshData} />
    ),
  },
];
