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
        <PopoverContent className="w-72">
          <ul className="text-sm space-y-1 py-2">
            {row.original.items?.map((item) => (
              <li key={item.id}>
                {item.material && item.material.name
                  ? `${item.material.name.charAt(0).toUpperCase() + item.material.name.slice(1)}`
                  : "N/A"} – {item.quantity} {item.unit}
              </li>
            ))}

          </ul>
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
