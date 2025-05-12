import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import axios from "@/lib/axios";

export type PendingPOForAudit = {
  id: number;
  po_no: string;
  rv_no: string;
  department: string;
  created_by: string;
  created_at: string;
  grand_total: number;
  items: {
    material_name: string;
    unit: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
};

export const columns = ({
  refreshData,
}: {
  refreshData: () => void;
}): ColumnDef<PendingPOForAudit>[] => [
  {
    header: "PO No.",
    accessorKey: "po_no",
    cell: ({ row }) => <span className="font-mono">{row.original.po_no}</span>,
  },
  {
    header: "RV No.",
    accessorKey: "rv_no",
    cell: ({ row }) => <span className="font-mono">{row.original.rv_no}</span>,
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) =>
      row.original.department.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    header: "Created By",
    accessorKey: "created_by",
  },
  {
    header: "Date",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    header: "Grand Total",
    accessorKey: "grand_total",
    cell: ({ row }) => (
      <span className="text-green-700 font-semibold">
        ₱{row.original.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    header: "Items",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">View</Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px]">
          <ul className="text-sm space-y-2 py-2">
            {row.original.items.map((item, i) => (
              <li key={i}>
                <div className="font-medium">
                  {item.material_name} – {item.quantity} {item.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  Unit Price: ₱{item.unit_price.toFixed(2)}<br />
                  Total: ₱{item.total_price.toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    header: "Action",
    cell: ({ row }) => {
      const handleAction = async (status: "approved" | "rejected") => {
        try {
          await axios.post(`/auditor/po/${row.original.id}/${status}/`);
          toast.success(`PO ${status}`);
          refreshData();
        } catch (err) {
          console.error(err);
          toast.error(`Failed to ${status} PO`);
        }
      };

      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleAction("approved")}>Approve</Button>
          <Button size="sm" variant="destructive" onClick={() => handleAction("rejected")}>Reject</Button>
        </div>
      );
    },
  },
];
