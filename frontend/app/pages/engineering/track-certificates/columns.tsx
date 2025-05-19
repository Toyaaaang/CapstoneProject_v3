import { ColumnDef } from "@tanstack/react-table";
import { CertificationRecord } from "@/hooks/shared/useCertificationMonitoring";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import axios from "@/lib/axios";

export const columns: ColumnDef<CertificationRecord>[] = [
  {
    header: "PO No.",
    accessorFn: row => row.purchase_order.po_number,
  },
  {
    header: "Delivery Date",
    accessorFn: row => row.delivery_record?.delivery_date ?? "—",
  },
  {
    header: "Created At",
    accessorFn: row => new Date(row.created_at).toLocaleString(),
  },
  {
    header: "Status",
    accessorFn: row => (row.is_finalized ? "Completed" : "In Progress"),
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const cert = row.original;
      const handleDownload = async () => {
        const res = await axios.get(`/requests/certifications/${cert.id}/download/`, {
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `CERT-${cert.purchase_order.po_number}.pdf`);
        document.body.appendChild(link);
        link.click();
      };

      return cert.is_finalized ? (
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-1" /> Download
        </Button>
      ) : (
        <span className="text-muted-foreground text-sm">Waiting for approvals</span>
      );
    },
  },
];
