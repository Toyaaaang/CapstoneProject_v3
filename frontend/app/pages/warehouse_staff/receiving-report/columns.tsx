import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import GenerateRRDialog from "@/components/dialogs/GenerateRRDialog"; 

export type ReadyForRR = {
    id: number;
    po_no: string;
    supplier: string;
    department: "engineering" | "operations_maintainance" | "finance";
    delivery_date: string;
    items: {
      material_name: string;
      unit: string;
      certified_quantity: number;
    }[];
  };
  
export const columns = ({
  refreshData,
}: {
  refreshData: () => void;
}): ColumnDef<ReadyForRR>[] => [
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
    header: "Items",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">View</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <ul className="text-sm space-y-2 py-2">
            {row.original.items.map((item, i) => (
              <li key={i} className="border-b pb-1">
                {item.material_name} – {item.certified_quantity} {item.unit}
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
      <GenerateRRDialog po={row.original} refreshData={refreshData} />
    ),
  },
];
