import { ColumnDef } from "@tanstack/react-table";
import EvaluateDialog from "@/components/dialogs/EvaluateDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type MaterialRequest = {
  id: number;
  department: string;
  purpose: string;
  status: string;
  requester: {
    id: number;
    first_name: string;
    last_name: string;
  };
  items: {
    custom_unit: string;
    custom_name: string;
    id: number;
    material: { id: number; name: string };
    quantity: number;
    unit: string;
  }[];
};

export const columns: ColumnDef<MaterialRequest>[] = [
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
    header: "Materials",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            View Items
          </Button>
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
                {row.original.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                  >
                    <div className="font-medium truncate flex items-center gap-1">
                      {item.material?.name
                        ? item.material.name.charAt(0).toUpperCase() + item.material.name.slice(1)
                        : (
                          <span className="italic text-muted-foreground">
                            {item.custom_name || "Custom Item"}
                          </span>
                        )}
                      {!item.material?.id && (
                        <Badge variant="outline" className="ml-1 text-[10px]">Custom</Badge>
                      )}
                    </div>
                    <div className="text-center text-muted-foreground">
                      {item.quantity}
                    </div>
                    <div className="text-right text-muted-foreground uppercase">
                      {item.custom_unit || item.unit}
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
  {
    header: "Actions",
    cell: ({ row, table }) => {
      const request = row.original;
      return (
        <EvaluateDialog
          requestId={request.id}
          items={request.items}
          refreshData={() => table.options.meta?.refreshData?.()}
        />
      );
    },
  },
];
