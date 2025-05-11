import { ColumnDef } from "@tanstack/react-table";
import ValidatePODialog from "@/components/dialogs/ValidatePODialog";

export type DeliveryPO = {
  id: number;
  po_no: string;
  supplier: string;
  delivery_date: string;
  department: string;
  items: {
    id: number;
    material_name: string;
    unit: string;
    ordered_quantity: number;
  }[];
};

export const columns = ({
  refreshData,
}: {
  refreshData: () => void;
}): ColumnDef<DeliveryPO>[] => [
  {
    header: "PO No.",
    accessorKey: "po_no",
    cell: ({ row }) => <span className="font-mono">{row.original.po_no}</span>,
  },
  {
    header: "Supplier",
    accessorKey: "supplier",
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) =>
      row.original.department.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    header: "Delivery Date",
    accessorKey: "delivery_date",
    cell: ({ row }) => {
      const date = new Date(row.original.delivery_date);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    header: "Action",
    cell: ({ row }) => <ValidatePODialog po={row.original} refreshData={refreshData} />,
  },
];
