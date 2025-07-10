"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import PrintablePOForm from "@/components/forms/PrintablePOForm";

export default function PrintablePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get(`/requests/purchase-orders/${id}/printable/`).then(res => setData(res.data));
  }, [id]);

  if (!data) return <div>Loading...</div>;

  return <PrintablePOForm data={data} />;
}