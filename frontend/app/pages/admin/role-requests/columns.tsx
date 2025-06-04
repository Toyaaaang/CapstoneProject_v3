import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoleRequests } from "@/hooks/useRoleRequests";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";


type RoleRequest = {
  id: number;
  full_name: string;
  role: string;
  is_role_confirmed: boolean;
  date_joined: string;
  id_image_url?: string;
  department?: string | null;
  suboffice?: string | null;
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
    id: "info",
    header: "ID card",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              <ImageIcon className="mr-2 h-4 w-4" /> View
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Here's more info about <strong>{user.full_name.charAt(0).toUpperCase() + user.full_name.slice(1)}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div><strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
              {user.department && (
                <div>
                  <strong>Department:</strong> {user.department.charAt(0).toUpperCase() + user.department.slice(1)}
                </div>
              )}
              {user.suboffice && (
                <div>
                  <strong>Suboffice:</strong> {user.suboffice.charAt(0).toUpperCase() + user.suboffice.slice(1)}
                </div>
              )}
              {user.id_image_url ? (
                <img
                  src={user.id_image_url}
                  alt="ID Image"
                  className="w-full rounded-lg border mt-3"
                />
              ) : (
                <div className="text-muted-foreground">No ID image uploaded</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
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