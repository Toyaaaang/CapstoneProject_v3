import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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
    material: { name: string };
    quantity: number;
    unit: string;
  }[];
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
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">View Items</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-h-72 overflow-auto">
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
                    <div className="font-medium truncate flex items-center gap-1">
                      {item.material?.name
                        ? (
                            <>
                              {item.material.name.charAt(0).toUpperCase() + item.material.name.slice(1)}
                              {item.custom_name && (
                                <Badge variant="outline" className="ml-1 text-[10px]">Custom</Badge>
                              )}
                            </>
                          )
                        : (
                            <>
                              <span className="italic text-muted-foreground">
                                {item.custom_name ? item.custom_name : "Custom Item"}
                              </span>
                              <Badge variant="outline" className="ml-1 text-[10px]">Custom</Badge>
                            </>
                          )}
                    </div>
                    <div className="text-center text-muted-foreground">
                      {item.quantity}
                    </div>
                    <div className="text-right text-muted-foreground uppercase">
                      {item.unit}
                    </div>
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
];
