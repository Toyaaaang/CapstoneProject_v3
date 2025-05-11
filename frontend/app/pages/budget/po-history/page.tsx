"use client";

import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable"; // Assuming you have a reusable DataTable component

export default function POHistoryPage() {
  const dummyData = [
    {
      supplier: "ABC Supplies",
      po_date: "2025-04-20",
      total_amount: 1500.0,
      status: "Delivered",
    },
    {
      supplier: "XYZ Distributors",
      po_date: "2025-04-18",
      total_amount: 750.5,
      status: "Pending",
    },
    {
      supplier: "Global Traders",
      po_date: "2025-04-15",
      total_amount: 1200.75,
      status: "Undelivered",
    },
  ];

  return (
    <div className="p-4">
      <DataTable title="Purchase Orders History" columns={columns} data={dummyData} />
    </div>
  );
}