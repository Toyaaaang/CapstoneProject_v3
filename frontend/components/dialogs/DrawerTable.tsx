import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import DataTable from "@/components/Tables/DataTable";
import { Button } from "@/components/ui/button";

export default function DrawerTable({
  title,
  columns,
  data,
  triggerLabel = "",
  children,
}: {
  title: string;
  columns: any[];
  data: any[];
  triggerLabel?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="default" size="sm" className="mt-2 w-full">{triggerLabel}</Button>
      </DrawerTrigger>
      <DrawerContent className="h-screen w-screen p-0">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="p-6">
          <DataTable
            title={title}
            columns={columns}
            data={data}
            page={1}
            setPage={() => {}}
            totalCount={data.length}
            pageSize={data.length}
          />
        </div>
        <DrawerFooter className="flex justify-between p-6">
          {children}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}