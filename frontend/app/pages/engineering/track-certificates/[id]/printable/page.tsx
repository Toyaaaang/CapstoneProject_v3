"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import PrintableCertification from "@/components/forms/PrintableCertification";

export default function PrintableCertificationPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    axios.get(`/requests/certifications/${id}/printable/`).then(res => setData(res.data));
  }, [id]);

  if (!data) return <div>Loading...</div>;

  return <PrintableCertification data={data} landscape />;
}