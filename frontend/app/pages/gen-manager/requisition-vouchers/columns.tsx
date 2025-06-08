import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RejectRVDialog } from "@/components/dialogs/RejectRVDialog";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import { Eye, CheckCircle2, X } from "lucide-react";

interface RequisitionVoucher {
  location: string;
  purpose: any;
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
    header: "Purpose",
    accessorKey: "purpose",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="max-w-[120px] truncate">
            {row.original.purpose?.length > 20
              ? row.original.purpose.slice(0, 20) + "..."
              : row.original.purpose || "—"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-xs break-words">
          <div className="text-sm text-zinc-700 dark:text-zinc-200 mb-2">
            <span className="font-semibold">Purpose:</span>{" "}
            {row.original.purpose || "No purpose provided."}
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-200">
            <span className="font-semibold">Location:</span>{" "}
            {row.original.location || "No location provided."}
          </div>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items || [];
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
                  {items.slice(0, 5).map((item: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        {item.material_name ? (
                          item.material_name
                        ) : (
                          <span className="italic text-zinc-700 dark:text-zinc-200">
                            {item.custom_name || "Custom Item"}
                          </span>
                        )}
                        {!item.material_name && (
                          <Badge variant="outline" className="ml-1 text-xs">Custom</Badge>
                        )}
                      </div>
                      <div className="text-center text-zinc-700 dark:text-zinc-200 text-xs">
                        {item.quantity}
                      </div>
                      <div className="text-right text-zinc-700 dark:text-zinc-200 text-xs">
                        {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
                {items.length > 5 && (
                  <div className="mt-2 text-xs text-center text-zinc-500 dark:text-zinc-400">
                    +{items.length - 5} more...
                  </div>
                )}
                <div className="mt-3 text-center">
                  <a
                    href={`/pages/gen-manager/requisition-vouchers/${row.original.id}/items`}
                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                  >
                    See Full Details
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 dark:text-zinc-400 text-xs">No items</div>
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

      const handlePreview = () => {
        window.open(`/pages/gen-manager/requisition-vouchers/${rvId}/printable`, "_blank");
      };

      return (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handlePreview}>
            <Eye/>
            Preview
          </Button>
          <ConfirmActionDialog
            trigger={
              <Button size="sm">
                <CheckCircle2 />
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
