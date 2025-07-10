"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import PrintableRVForm from "@/components/forms/PrintableRVForm"; // Make sure this exists

export default function PrintablePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get(`/requests/requisition-vouchers/${id}/printable/`).then(res => setData(res.data));
  }, [id]);

  if (!data) return <div>Loading...</div>;

  return <PrintableRVForm data={data} />;
}