"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import DataTable from "@/components/Tables/DataTable";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import { RejectDialog } from "@/components/dialogs/RejectDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import TableLoader from "@/components/Loaders/TableLoader";

export default function ChargeTicketItemsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  useEffect(() => {
    axios.get(`/requests/charge-tickets/${id}/`).then(res => {
      setTicket(res.data);
      setLoading(false);
    });
  }, [id]);

  // Approve handler for the whole ticket
  const handleApprove = async () => {
    try {
      await axios.post(`/requests/charge-tickets/${id}/approve/`);
      toast.success("Charge ticket approved.");
      router.back();
    } catch {
      toast.error("Approval failed.");
    }
  };

  // Refresh data after rejection
  const refreshData = () => {
    axios.get(`/requests/charge-tickets/${id}/`).then(res => setTicket(res.data));
  };

  if (loading) return <TableLoader />;
  if (!ticket) return <div className="p-8">Not found.</div>;

  // Paginate items
  const paginatedItems = ticket.items.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      header: "Material",
      accessorKey: "material.name",
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: ({ row }: any) => Number(row.original.quantity).toFixed(0),
    },
    {
      header: "Unit",
      accessorKey: "unit",
    },
    // Removed the Action column
  ];

  return (
    <div className="w-full mx-auto p-6">
      <DataTable
        title={`Items for Charge Ticket -- #${ticket.ic_no || ticket.mc_no}`}
        columns={columns}
        data={paginatedItems}
        page={page}
        setPage={setPage}
        totalCount={ticket.items.length}
        pageSize={pageSize}
      />
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft />
          Back
        </Button>
        <ConfirmActionDialog
          trigger={<Button><Check/> Approve</Button>}
          title="Approve Charge Ticket?"
          description="Are you sure you want to approve this charge ticket?"
          confirmLabel="Approve"
          cancelLabel="Cancel"
          onConfirm={handleApprove}
        />
        <RejectDialog
          ticketId={Number(id)}
          refreshData={refreshData}
        />
      </div>
    </div>
  );
}