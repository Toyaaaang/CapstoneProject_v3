import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RejectDialog } from "@/components/dialogs/RejectDialog";
import axios from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import Link from "next/link";
import { Check, Eye } from "lucide-react";

export type PendingChargeRequestForGM = {
  location: any;
  id: number;
  request_no: string;
  department: string;
  requester: {
      id: number;
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
}): ColumnDef<PendingChargeRequestForGM>[] => [
  {
    header: "Request No.",
    accessorKey: "id", // needed for fallback
    cell: ({ row }) => {
      const { ic_no, mc_no, id } = row.original;
      const no = ic_no || mc_no || `CT-${id}`;
      return <span className="font-mono">{no}</span>;
    },
  },
  {
      header: "Department",
      accessorKey: "department",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.department.replace(/_/g, " ").toUpperCase()}
        </Badge>
      ),
    },
  {
    header: "Requested By",
    accessorKey: "requester",
    cell: ({ row }) => {
      const { first_name, last_name } = row.original.requester || {};
      return <span>{first_name} {last_name}</span>;

    },
  },
  {
    header: "Purpose",
    accessorKey: "purpose",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button className="max-w-[180px] truncate">
            {row.original.purpose || "No purpose provided"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 space-y-2">
          <div>
            <span className="font-semibold text-sm">Purpose:</span>
            <span className="ml-1 text-sm">{row.original.purpose}</span>
          </div>
          <div>
            <span className="font-semibold text-sm">Location of Work:</span>
            <span className="ml-1 text-sm">
              {row.original.location || (
                <span className="italic text-muted-foreground">No location</span>
              )}
            </span>
          </div>
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
    header: "Items",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline"><Eye/>View</Button>
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
                {row.original.items.slice(0, 5).map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                  >
                    <div className="font-medium truncate">{item.material_name}</div>
                    <div className="text-center text-muted-foreground">{item.quantity}</div>
                    <div className="text-right text-muted-foreground">{item.unit}</div>
                  </div>
                ))}
              </div>
              {row.original.items.length > 5 && (
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  +{row.original.items.length - 5} more...
                </div>
              )}
              <div className="mt-3 text-center">
                <Link
                  href={`/pages/gen-manager/charge-tickets/${row.original.id}/items`}
                  className="text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  Show Full Info
                </Link>
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

      const handleApprove = async () => {
        try {
          await axios.post(`/requests/charge-tickets/${ticketId}/approve/`);
          toast.success("Charge ticket approved.");
          table.options.meta?.refreshData?.();
        } catch (err) {
          console.error(err);
          toast.error("Approval failed.");
        }
      };

      return (
        <div className="flex gap-2">
          <ConfirmActionDialog
            trigger={
              <Button>
                <Check/>
                Approve
              </Button>
            }
            title="Approve Charge Ticket?"
            description="Do you want to continue with this action? This cannot be undone."
            confirmLabel="Approve"
            cancelLabel="Cancel"
            onConfirm={handleApprove}
          />
          <RejectDialog
            ticketId={ticketId}
            refreshData={() => table.options.meta?.refreshData?.()}
          />
        </div>
      );
    },
  }
  
];
