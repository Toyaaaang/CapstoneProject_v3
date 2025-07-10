import { ColumnDef } from "@tanstack/react-table";
import EvaluateDialog from "@/components/dialogs/EvaluateDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import DrawerTable from "@/components/dialogs/DrawerTable";

export type MaterialRequest = {
  location: string;
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
          <Button>
            {row.original.purpose || "No purpose provided"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="mb-2">
            <span className="font-semibold">Purpose:</span>
            <span className="ml-1">{row.original.purpose || "No purpose provided"}</span>
          </div>
          <div>
            <span className="font-semibold">Location:</span>
            <span className="ml-1">{row.original.location || "No location provided"}</span>
          </div>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    header: "Materials",
    cell: ({ row }) => {
      const items = row.original.items || [];
      const previewItems = items.slice(0, 5);

      // Define columns for the drawer table
      const drawerColumns = [
        { header: "Material", accessorKey: "material_name" },
        { header: "Quantity", accessorKey: "quantity" },
        { header: "Unit", accessorKey: "unit" },
      ];

      // Prepare data for the drawer table
      const drawerData = items.map((item) => ({
        material_name: item.material?.name || item.custom_name || "Custom Item",
        quantity: parseInt(item.quantity as any, 10),
        unit: item.custom_unit || item.unit,
      }));

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
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
                  {previewItems.map((item) => (
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
                        {parseInt(item.quantity as any, 10)}
                      </div>
                      <div className="text-right text-muted-foreground">
                        {item.custom_unit || item.unit}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Always show Full details trigger button centered below */}
                <div className="flex justify-center pt-2">
                  <DrawerTable
                    triggerLabel="Full details"
                    title={`All Materials for MR-${row.original.id}`}
                    columns={drawerColumns}
                    data={drawerData}
                  >
                    <EvaluateDialog
                      requestId={row.original.id}
                      items={row.original.items}
                      refreshData={() => table?.options.meta?.refreshData?.()}
                    />
                  </DrawerTable>
                  
                </div>
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
