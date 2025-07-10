import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import axios from "@/lib/axios";
import { toast } from "sonner";

export type SalvageReturn = {
    id: number;
    mrt_no: string;
    returned_by: string;
    received_date: string;
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
}): ColumnDef<SalvageReturn>[] => [
  {
    header: "MRT No.",
    accessorKey: "mrt_no",
    cell: ({ row }) => <span className="font-mono">{row.original.mrt_no}</span>,
  },
  {
    header: "Returned By",
    accessorKey: "returned_by",
  },
  {
    header: "Date Received",
    accessorKey: "received_date",
    cell: ({ row }) => {
      const date = new Date(row.original.received_date);
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
              <li key={i} className="list-disc list-inside">
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
      const id = row.original.id;

      const handleAction = async (status: "approved" | "rejected") => {
        try {
          await axios.post(`/warehouse/salvage/${id}/${status}/`);
          toast.success(`Return ${status}`);
          refreshData();
        } catch (err) {
          console.error(err);
          toast.error(`Failed to ${status} return`);
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
