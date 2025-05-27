import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoleRequests } from "@/hooks/useRoleRequests";

type RoleRequest = {
  id: number;
  full_name: string;
  role: string;
  is_role_confirmed: boolean;
  date_joined: string;
};

export const columns: ColumnDef<RoleRequest>[] = [
  {
    accessorKey: "full_name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.full_name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return <div className="py-2">{name}</div>;
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => {
      const role = getValue() as string;
      return <span className="capitalize">{role}</span>;
    },
  },
  {
    accessorKey: "date_joined",
    header: "Requested on",
    cell: ({ row }) => (
      <div className="py-2">
        {new Date(row.original.date_joined).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    ),
  },
  {
    accessorKey: "is_role_confirmed",
    header: "Status",
    cell: ({ row }) => (
      <Badge className="py-2 px-2">
        {row.original.is_role_confirmed ? "Confirmed" : "Pending"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const { approveRoleRequest, rejectRoleRequest } = useRoleRequests();

      return (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => approveRoleRequest(row.original.id)}
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => rejectRoleRequest(row.original.id)}
          >
            Reject
          </Button>
        </div>
      );
    },
  },
];