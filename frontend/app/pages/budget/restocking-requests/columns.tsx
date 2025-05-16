import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RejectRVDialog } from "@/components/dialogs/RejectRVDialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import axios from "@/lib/axios";
import { toast } from "sonner";

export const columns: ColumnDef<any>[] = [
  {
    header: "RV No.",
    accessorKey: "rv_number",
  },
  {
    header: "Requester",
    accessorFn: (row) => `${row.requester.first_name} ${row.requester.last_name}`,
  },
  {
    header: "Department",
    accessorKey: "department",
  },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
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
                    <div className="font-medium">{item.material_name}</div>
                    <div className="text-muted-foreground text-xs">
                      {item.quantity} {item.unit}
                    </div>
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

      const handleRecommend = async () => {
        try {
          await axios.patch(`/requests/requisition-vouchers/${rvId}/recommend/`);
          toast.success("RV recommended.");
          table.options.meta?.refreshData?.();
        } catch (err) {
          toast.error("Recommendation failed.");
        }
      };

      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={handleRecommend}>
            Recommend
          </Button>
          <RejectRVDialog
            rvId={rvId}
            refreshData={() => table.options.meta?.refreshData?.()}
          />
        </div>
      );
    },
  },
];
