"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import PrintableRVForm from "@/components/forms/PrintableRVForm";
import { Button } from "@/components/ui/button";
import PrintableFormLoader from "@/components/Loaders/PrintableFormLoader";

export default function PrintablePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/requests/requisition-vouchers/${id}/printable/`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PrintableFormLoader />;

  return (
    <div>
      <div className="mb-4 print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>
      <PrintableRVForm data={data} />
    </div>
  );
}