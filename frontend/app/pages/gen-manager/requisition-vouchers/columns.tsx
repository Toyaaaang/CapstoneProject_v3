import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RejectRVDialog } from "@/components/dialogs/RejectRVDialog";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";

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
    cell: ({ row }) => (
      <Badge>
        {row.original.department
          ? row.original.department.replace(/_/g, " ").toUpperCase()
          : ""}
      </Badge>
    ),
  },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = row.original.created_at ? new Date(row.original.created_at) : null;
      return date
        ? date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge>
        {row.original.status
          ? row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)
          : ""}
      </Badge>
    ),
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
            {items.length > 0 ? (
              <div>
                <div className="grid grid-cols-3 gap-2 font-semibold text-xs mb-2 px-1">
                  <span>Material</span>
                  <span className="text-center">Quantity</span>
                  <span className="text-right">Unit</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        {item.material_name ? (
                          item.material_name
                        ) : (
                          <span className="italic text-muted-foreground">
                            {item.custom_name || "Custom Item"}
                          </span>
                        )}
                        {!item.material_name && (
                          <Badge variant="outline" className="ml-1 text-xs">Custom</Badge>
                        )}
                      </div>
                      <div className="text-center text-muted-foreground text-xs">
                        {item.quantity}
                      </div>
                      <div className="text-right text-muted-foreground text-xs">
                        {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-xs">No items</div>
            )}
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
          <ConfirmActionDialog
            trigger={
              <Button size="sm">
                Approve
              </Button>
            }
            title="Approve Requisition Voucher?"
            description="Do you want to continue with this action? This cannot be undone."
            confirmLabel="Approve"
            cancelLabel="Cancel"
            onConfirm={handleApprove}
          />
          <RejectRVDialog
            rvId={rvId}
            refreshData={() => table.options.meta?.refreshData?.()}
          />
        </div>
      );
    },
  },
];
