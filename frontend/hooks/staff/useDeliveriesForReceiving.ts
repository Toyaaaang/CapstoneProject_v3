import axios from "@/lib/axios";
import { useState, useEffect } from "react";

export interface DeliveryForReceiving {
  id: number;
  purchase_order: {
    po_number: string;
  };
  material: {
    name: string;
  };
  delivered_quantity: number;
  delivery_status: string;
  delivery_date: string;
}

interface Props {
  page: number;
  pageSize: number;
}

export default function useDeliveriesForReceiving({ page, pageSize }: Props) {
  const [data, setData] = useState<DeliveryForReceiving[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/requests/receiving-reports/deliveries/", {
        params: { page, page_size: pageSize },
      });
      setData(res.data.results);
      setTotalCount(res.data.count);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  return { data, isLoading, totalCount, refetch: fetchData };
}
