import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export type ReleasedChargeTicket = {
  id: number;
  ic_no?: string;
  mc_no?: string;
  department: string;
  requester: {
    first_name: string;
    last_name: string;
  };
  purpose: string;
  location?: string;
  created_at: string;
  items: {
    material: any;
    material_name: string;
    unit: string;
    quantity: number;
  }[];
};

export const columns: ColumnDef<ReleasedChargeTicket>[] = [
  {
    header: "Ticket No.",
    accessorKey: "id",
    cell: ({ row }) => {
      const { ic_no, mc_no, id } = row.original;
      return <span className="font-mono">{ic_no || mc_no || `CT-${id}`}</span>;
    },
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.department ? row.original.department.replace(/_/g, " ").toUpperCase() : "—"}
      </Badge>
    ),
  },
  {
    header: "Requested By",
    accessorKey: "requester",
    cell: ({ row }) =>
      `${row.original.requester.first_name} ${row.original.requester.last_name}`,
  },
  {
    header: "Purpose",
    accessorKey: "purpose",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="w-32 truncate text-xs"
            title={row.original.purpose}
          >
            {row.original.purpose}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div>
            <div className="font-semibold mb-1">Purpose:</div>
            <div className="mb-2 text-sm font-normal">{row.original.purpose}</div>
            <div className="font-semibold mb-1">Location:</div>
            <div className="mb-2 text-sm font-normal">
              {row.original.location || "No location"}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    header: "Date Released",
    accessorKey: "created_at",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
  },
  {
    header: "Materials",
    cell: ({ row }) => {
      const router = useRouter();
      const items = row.original.items || [];
      const previewItems = items.slice(0, 5);

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-32 text-xs"
            >
              <Eye className="mr-1 h-4 w-4" />
              View Items
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-72 overflow-auto">
            {items.length > 0 ? (
              <div>
                <div className="grid grid-cols-3 gap-2 font-semibold text-xs mb-2 px-1">
                  <span>Material</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Unit</span>
                </div>
                <div className="space-y-2">
                  {previewItems.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                    >
                      <div className="font-medium truncate">{item.material.name}</div>
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
                  className="w-full mt-3 text-xs"
                  onClick={() =>
                    router.push(
                      `/pages/warehouse_staff/charge-history/${row.original.id}/items`
                    )
                  }
                >
                  Show Full Info
                </Button>
              </div>
            ) : (
              <div className="text-muted-foreground text-xs italic py-4 text-center">
                No items
              </div>
            )}
          </PopoverContent>
        </Popover>
      );
    },
  },
];