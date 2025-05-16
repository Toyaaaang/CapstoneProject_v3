import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RejectRVDialog } from "@/components/dialogs/RejectRVDialog";

interface RequisitionVoucher {
  id: number;
  rv_number: string;
  department: string;
  status: string;
  created_at: string;
  requester: {
    first_name: string;
    last_name: string;
  };
  items: {
    id: number;
    material_name: string;
    quantity: number;
    unit: string;
  }[];
}

export const columns: ColumnDef<RequisitionVoucher>[] = [
  {
    header: "RV No.",
    accessorKey: "rv_number",
  },
  {
    header: "Requester",
    accessorFn: (row) => `${row.requester?.first_name || ""} ${row.requester?.last_name || ""}`,
  },
  {
    header: "Department",
    accessorKey: "department",
  },
  {
    header: "Created At",
    accessorFn: (row) => new Date(row.created_at).toLocaleDateString(),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => <Badge>{row.original.status}</Badge>,
  },
  {
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items;

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              View Items
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-64 overflow-y-auto">
            <div className="space-y-2 text-sm">
              {items.length > 0 ? (
                items.map((item: any, index: number) => (
                  <div key={index} className="border-b pb-1">
                    <div className="font-medium">{item.material_name}   -   {item.quantity} {item.unit}</div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-xs">No items</div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },

  {
    header: "Action",
    cell: ({ row, table }) => {
      const rvId = row.original.id;

      const handleApprove = async () => {
        try {
          await axios.patch(`/requests/requisition-vouchers/${rvId}/approve/`);
          toast.success("RV approved.");
          table.options.meta?.refreshData?.();
        } catch (err) {
          toast.error("Approval failed.");
        }
      };

      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={handleApprove}>Approve</Button>
          <RejectRVDialog
            rvId={rvId}
            refreshData={() => table.options.meta?.refreshData?.()}
          />
        </div>
      );
    },
  },
];
