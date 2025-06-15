"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import DataTable from "@/components/Tables/DataTable";
import { columns, MaterialRequest } from "./columns"; // Import type from columns

export default function AssignWorkOrderPage() {
  const [data, setData] = useState<MaterialRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    try {
        const res = await axios.get(`/requests/material-requests/?page=${page}`);
        const sorted = [...res.data.results].sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setData(sorted);
        setTotalCount(res.data.count);
    } catch (err) {
        console.error("Failed to load material requests", err);
    }
  };


  useEffect(() => {
    fetchData();
  }, [page]);

  return (
    <div className="p-6">
      <DataTable
        columns={columns(fetchData)}
        data={data}
        title="Material Requests for Work Order Assignment"
        refreshData={fetchData}
        page={page}
        setPage={setPage}
        totalCount={totalCount}
        pageSize={8}
      />
    </div>
  );
}