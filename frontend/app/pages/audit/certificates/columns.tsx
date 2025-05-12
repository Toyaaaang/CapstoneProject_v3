import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import axios from "@/lib/axios";
import { toast } from "sonner";

export type PendingCertificationForAudit = {
    id: number;
    po_no: string;
    department: string;
    certified_by: string;
    certified_at: string;
    items: {
      material_name: string;
      unit: string;
      quantity: number;
    }[];
  };
  
export const columns = ({
  refreshData,
}: {
  refreshData: () => void;
}): ColumnDef<PendingCertificationForAudit>[] => [
  {
    header: "PO No.",
    accessorKey: "po_no",
    cell: ({ row }) => <span className="font-mono">{row.original.po_no}</span>,
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) =>
      row.original.department.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    header: "Certified By",
    accessorKey: "certified_by",
  },
  {
    header: "Certified At",
    accessorKey: "certified_at",
    cell: ({ row }) => {
      const date = new Date(row.original.certified_at);
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
          <Button variant="outline" size="sm">View</Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <ul className="text-sm space-y-1 py-2">
            {row.original.items.map((item, i) => (
              <li key={i}>
                {item.material_name} – {item.quantity} {item.unit}
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
          await axios.post(`/auditor/certification/${row.original.id}/${status}/`);
          toast.success(`Certification ${status}`);
          refreshData();
        } catch (err) {
          console.error(err);
          toast.error(`Failed to ${status} certification`);
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
