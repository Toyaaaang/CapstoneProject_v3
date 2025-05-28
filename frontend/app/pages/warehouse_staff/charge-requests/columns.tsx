import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";

export type ChargeTicketForRelease = {
  id: number;
  ic_no?: string;
  mc_no?: string;
  department: string;
  requester: {
    first_name: string;
    last_name: string;
  };
  purpose: string;
  created_at: string;
  items: {
    material_name: string;
    quantity: number;
    unit: string;
  }[];
};

export const columns = ({
  refreshData,
}: {
  refreshData: () => void;
}): ColumnDef<ChargeTicketForRelease>[] => [
  {
    header: "Request No.",
    accessorKey: "id",
    cell: ({ row }) => {
      const { ic_no, mc_no, id } = row.original;
      return <span className="font-mono">{ic_no || mc_no || `CT-${id}`}</span>;
    },
  },
  {
  header: "Department",
  accessorKey: "department", // department is at the top level
  cell: ({ getValue }) => {
    const dept = getValue<string>();
    return (
      <Badge variant="secondary">
        {dept ? dept.replace(/_/g, " ").toUpperCase() : "—"}
      </Badge>
    );
  },
},
  {
    header: "Requested By",
    accessorKey: "requester",
    cell: ({ row }) => {
      const r = row.original.requester;
      return `${r.first_name} ${r.last_name}`;
    },
  },
  {
    header: "Purpose",
    accessorKey: "purpose",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button>{row.original.purpose || "No purpose provided"}</Button>

        </PopoverTrigger>
        <PopoverContent className="w-72">
          <p className="text-sm">{row.original.purpose}</p>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    header: "Date Created",
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
    header: "Materials",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            View Items
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 max-h-72 overflow-auto">
          {row.original.items && row.original.items.length > 0 ? (
            <div>
              <div className="grid grid-cols-3 gap-2 font-semibold text-xs mb-2 px-1">
                <span>Material</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Unit</span>
              </div>
              <div className="space-y-2">
                {row.original.items.map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                  >
                    <div className="font-medium truncate">{item.material.name}</div>
                    <div className="text-center text-muted-foreground">{item.quantity}</div>
                    <div className="text-right text-muted-foreground">{item.unit}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-xs italic py-4 text-center">No items</div>
          )}
        </PopoverContent>
      </Popover>
    ),
  },
  {
    header: "Action",
    cell: ({ row, table }) => {
      const ticketId = row.original.id;

      const handleRelease = async () => {
        try {
          await axios.post(`/requests/charge-tickets/${ticketId}/release/`);
          toast.success("Marked as released.");
          table.options.meta?.refreshData?.();
        } catch (err) {
          toast.error("Failed to mark as released.");
        }
      };

      return (
        <ConfirmActionDialog
          trigger={
            <Button size="sm">
              Confirm Release
            </Button>
          }
          title="Mark as Released?"
          description="Do you want to continue with this action? This cannot be undone."
          confirmLabel="Release"
          cancelLabel="Cancel"
          onConfirm={handleRelease}
        />
      );
    },
  },
];
