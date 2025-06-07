"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import PrintableChargeForm from "@/components/forms/PrintableChargeForm";

export default function PrintablePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get(`/requests/charge-tickets/${id}/printable/`).then(res => setData(res.data));
  }, [id]);

  if (!data) return <div>Loading...</div>;

  return <PrintableChargeForm data={data} />;
}