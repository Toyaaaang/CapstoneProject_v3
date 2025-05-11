"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import { toast } from "sonner";

export default function EvaluationPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    axios
      .get("/requests/material-requests/?status=pending")
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        toast.error("Failed to load evaluation requests.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 space-y-4">
      {loading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Pending Material Requests"
          columns={columns}
          data={data}
          refreshData={fetchData} // passed to dialog so it can refetch
          meta={{ refreshData: fetchData }}
        />
      )}
    </div>
  );
}
