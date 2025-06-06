import { useState, useEffect } from "react";
import DataTable from "@/components/Tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import TableLoader from "@/components/Loaders/TableLoader";
import axios from "@/lib/axios";

// Default columns for materials
export const defaultMaterialColumns: ColumnDef<any>[] = [
  {
    header: "Name",
    accessorKey: "name",
    size: 180,
  },
  {
    header: "Unit",
    accessorKey: "unit",
    size: 100,
  },
  {
    header: "Category",
    accessorKey: "category",
    size: 140,
  },
];

export default function MaterialsTable({
  data,
  columns = defaultMaterialColumns,
  fetchUrl = "/admin/materials/all/",
  loading: loadingProp,
  ...props
}: {
  data?: any[];
  columns?: ColumnDef<any>[];
  fetchUrl?: string;
  loading?: boolean;
  [key: string]: any;
}) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data) {
      setMaterials(data);
      setLoading(false);
    } else {
      axios.get(fetchUrl)
        .then(res => setMaterials(res.data.results ?? res.data))
        .catch(() => setMaterials([]))
        .finally(() => setLoading(false));
    }
  }, [data, fetchUrl]);

  if (loadingProp ?? loading) return <TableLoader />;

  return (
    <DataTable
      title="Material Request"
      columns={columns}
      data={materials}
      page={1}
      setPage={() => {}}
      totalCount={materials.length}
      pageSize={materials.length}
      {...props}
    />
  );
}