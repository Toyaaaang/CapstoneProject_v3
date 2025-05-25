import { ColumnDef } from "@tanstack/react-table";
import { CertificationRecord } from "@/hooks/shared/useCertificationMonitoring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import axios from "@/lib/axios";

export const columns: ColumnDef<CertificationRecord>[] = [
	{
		header: "PO No.",
		accessorFn: row => row.purchase_order.po_number,
		cell: ({ row }) => (
			<span className="font-mono text-xs bg-muted/60 px-2 py-1 rounded">
				{row.original.purchase_order.po_number}
			</span>
		),
	},
	{
		header: "Delivery Date",
		accessorFn: row => row.delivery_record?.delivery_date ?? "—",
		cell: ({ row }) =>
			row.original.delivery_record?.delivery_date
				? new Date(row.original.delivery_record.delivery_date).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
				  })
				: <span className="italic text-muted-foreground">N/A</span>,
	},
	{
		header: "Created At",
		accessorFn: row => row.created_at,
		cell: ({ row }) =>
			row.original.created_at
				? new Date(row.original.created_at).toLocaleString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
						hour12: true,
				  })
				: <span className="italic text-muted-foreground">N/A</span>,
	},
	{
		header: "Status",
		accessorFn: row => (row.is_finalized ? "Completed" : "In Progress"),
		cell: ({ row }) => (
			<Badge variant={row.original.is_finalized ? "default" : "secondary"}>
				{row.original.is_finalized ? "COMPLETED" : "IN PROGRESS"}
			</Badge>
		),
	},
	{
		header: "Actions",
		cell: ({ row }) => {
			const cert = row.original;
			const handleDownload = async () => {
				const res = await axios.get(
					`/requests/certifications/${cert.id}/download/`,
					{
						responseType: "blob",
					}
				);
				const url = window.URL.createObjectURL(new Blob([res.data]));
				const link = document.createElement("a");
				link.href = url;
				link.setAttribute("download", `CERT-${cert.purchase_order.po_number}.pdf`);
				document.body.appendChild(link);
				link.click();
				link.remove();
			};

			return cert.is_finalized ? (
				<Button variant="outline" size="sm" onClick={handleDownload}>
					<Download className="w-4 h-4 mr-1" /> Download
				</Button>
			) : (
				<span className="text-muted-foreground text-sm">
					Waiting for approvals
				</span>
			);
		},
	},
];
