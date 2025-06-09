"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function VarianceReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios
      .get(`/requests/purchase-orders/${id}/variance-report/`)
      .then((res) => setData(res.data));
  }, [id]);

  if (!data) return <div>Loading...</div>;

  // Get RV No and Department from requisition_voucher if available
  const rvNo = data.requisition_voucher?.rv_number || data.rv_no || "—";
  const department = data.requisition_voucher?.department || data.department || data.dept || "—";
  const formattedDate = data.created_at
    ? new Date(data.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print:w-full print:p-0">
      {/* Print/Download Buttons */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold">Variance Report</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <Button onClick={() => window.print()} variant="outline">
            <Printer />
            Print
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {/* Header with logo and company info */}
        <div className="flex items-center gap-4 mb-2 justify-center">
          <img
            src="/app-logo.png"
            alt="Company Logo"
            className="h-16 w-16 object-contain"
          />
          <div>
            <div className="text-xl font-bold leading-tight">
              Quezon Electric Cooperative I
            </div>
            <div className="ml-8 text-muted-foreground text-sm">
              Brgy. Poctol, Pitogo, Quezon, 4308
            </div>
          </div>
        </div>
        <div className="text-l font-bold text-center mb-2">
          VARIANCE REPORT
        </div>
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs mb-2">
          <div>
            <span className="font-semibold">PO No:</span>{" "}
            <span className="italic">{data.po_number || data.id}</span>
          </div>
          <div>
            <span className="font-semibold">RV No:</span>{" "}
            <span className="italic">{rvNo}</span>
          </div>
          <div>
            <span className="font-semibold">Date:</span>{" "}
            {formattedDate}
          </div>
          <div>
            <span className="font-semibold">Department:</span>{" "}
            <span className="capitalize">{department}</span>
          </div>
          <div>
            <span className="font-semibold">Supplier:</span>{" "}
            <span className="capitalize">{data.supplier_name || data.supplier?.name}</span>
          </div>
        </div>

        <Separator />

        {/* Variance Table */}
        <div className="mb-2 p-2">
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left w-8">No.</th>
                <th className="border px-2 py-1 text-left">Material Name</th>
                <th className="border px-2 py-1 text-left">Unit</th>
                <th className="border px-2 py-1 text-right">Quantity</th>
                <th className="border px-2 py-1 text-right">Estimate (₱)</th>
                <th className="border px-2 py-1 text-right">Actual (₱)</th>
                <th className="border px-2 py-1 text-right">Variance (₱)</th>
              </tr>
            </thead>
            <tbody>
              {data.items?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border px-2 py-1">{item.material_name || item.custom_name || item.name}</td>
                  <td className="border px-2 py-1">{item.unit}</td>
                  <td className="border px-2 py-1 text-right">{item.quantity}</td>
                  <td className="border px-2 py-1 text-right">
                    {item.estimate !== null && item.estimate !== undefined
                      ? `₱${parseFloat(item.estimate).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                      : <span className="italic text-gray-800 dark:text-gray-400">N/A</span>
                    }
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {item.unit_price !== null && item.unit_price !== undefined
                      ? `₱${parseFloat(item.unit_price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                      : <span className="italic text-gray-800 dark:text-gray-400">N/A</span>
                    }
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {item.variance !== null && item.variance !== undefined
                      ? (
                        <span className={item.variance > 0 ? "text-red-600 font-mono" : "text-green-600 font-mono"}>
                          ₱{parseFloat(item.variance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </span>
                      )
                      : <span className="italic text-gray-800 dark:text-gray-400">N/A</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Print Style Overrides */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}