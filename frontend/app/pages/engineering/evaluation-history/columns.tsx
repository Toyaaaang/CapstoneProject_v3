import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useRouter } from "next/navigation";

// ✅ Type definition
export type EvaluatedRequest = {
  id: number;
  requester: {
    id: number;
    first_name: string;
    last_name: string;
  };
  department: string;
  purpose: string;
  status: string;
  created_at: string;
  items: {
    material?: { name: string };
    custom_name?: string;
    quantity: number;
    unit: string;
  }[];
  work_order_no?: string;
  manpower?: string;
  target_completion?: string;
  actual_completion?: string;
  duration?: string;
  requester_department?: string;
  rejection_reason?: string;
};

// ✅ Column definitions
export const columns: ColumnDef<EvaluatedRequest>[] = [
  {
    header: "Request ID",
    accessorKey: "id",
    cell: ({ row }) => <span className="font-mono">MR-{row.original.id}</span>,
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
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.department.replace(/_/g, " ").toUpperCase()}
      </Badge>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      const labelMap: Record<string, string> = {
        charged: "Charge Ticket Created",
        requisitioned: "Requisition Voucher Created",
        partially_fulfilled: "Partially Fulfilled",
        rejected: "Rejected",
        invalid: "Invalid",
      };
      const variantMap: Record<string, "info" | "warning" | "destructive" | "secondary"> = {
        charged: "info",
        requisitioned: "info",
        partially_fulfilled: "warning",
        rejected: "destructive",
        invalid: "destructive",
      };
      return (
        <Badge variant={variantMap[status] || "secondary"}>
          {labelMap[status] || status}
        </Badge>
      );
    },
  },
  {
    header: "Materials",
    cell: ({ row }) => {
      const router = useRouter();
      const items = row.original.items || [];
      const previewItems = items.slice(0, 5);
      const reqId = row.original.id;

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">View Items</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-72 overflow-auto">
            {items.length > 0 ? (
              <div>
                <div className="grid grid-cols-3 gap-2 font-semibold text-xs mb-2 px-1">
                  <span>Material</span>
                  <span className="text-center">Quantity</span>
                  <span className="text-right">Unit</span>
                </div>
                <div className="space-y-2">
                  {previewItems.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                    >
                      <div className="font-medium truncate flex items-center gap-1">
                        {item.material?.name ? (
                          <>
                            {item.material.name.charAt(0).toUpperCase() + item.material.name.slice(1)}
                            {item.custom_name && (
                              <Badge variant="outline" className="ml-1 text-[10px]">Custom</Badge>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="italic text-muted-foreground">
                              {item.custom_name ? item.custom_name : "Custom Item"}
                            </span>
                            <Badge variant="outline" className="ml-1 text-[10px]">Custom</Badge>
                          </>
                        )}
                      </div>
                      <div className="text-center text-muted-foreground">
                        {Math.round(item.quantity)}
                      </div>
                      <div className="text-right text-muted-foreground lowercase">
                        {item.unit}
                      </div>
                    </div>
                  ))}
                  {items.length > 5 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      ...and {items.length - 5} more
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-3"
                  onClick={() => router.push(`/pages/engineering/evaluation-history/${reqId}/items`)}
                >
                  Full Details
                </Button>
              </div>
            ) : (
              <div className="text-muted-foreground text-xs italic py-4 text-center">No items</div>
            )}
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    header: "Full Details",
    cell: ({ row }) => {
      const req = row.original;
      const isEng = req.department === "engineering";
      const isOMD = req.department === "operations_maintenance";
      const isFinance = req.department === "finance";

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">Details</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] text-sm space-y-2">
            {(isEng || isOMD) && (
              <>
                {req.work_order_no && <p><strong>Work Order No:</strong> {req.work_order_no}</p>}
                {req.manpower && <p><strong>Manpower:</strong> {req.manpower}</p>}
                {req.target_completion && <p><strong>Target Completion:</strong> {req.target_completion}</p>}
                {req.actual_completion && <p><strong>Actual Completion:</strong> {req.actual_completion}</p>}
                {req.duration && <p><strong>Duration:</strong> {req.duration}</p>}
              </>
            )}

            {isFinance && req.requester_department && (
              <p><strong>Requester Dept:</strong> {req.requester_department}</p>
            )}

            {["rejected", "invalid"].includes(req.status) && req.rejection_reason && (
              <p className="text-red-600"><strong>Rejection Reason:</strong> {req.rejection_reason}</p>
            )}
          </PopoverContent>
        </Popover>
      );
    },
  },
];
