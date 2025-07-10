"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnFiltersState } from "@tanstack/react-table";

interface TableFilterProps {
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (filters: ColumnFiltersState) => void;
  columns: {
    id: string;
    label: string;
    type?: "text" | "select";
    options?: { value: string; label: string }[];
  }[];
}

export function TableFilter({
  columnFilters,
  onColumnFiltersChange,
  columns,
}: TableFilterProps) {
  const handleFilterChange = (columnId: string, value: string) => {
    onColumnFiltersChange([
      ...columnFilters.filter((filter) => filter.id !== columnId),
      {
        id: columnId,
        value,
      },
    ]);
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-md">
      {columns.map((column) => {
        const filter = columnFilters.find((f) => f.id === column.id);
        
        if (column.type === "select" && column.options) {
          return (
            <div key={column.id} className="flex flex-col gap-2">
              <label className="text-sm font-medium">{column.label}</label>
              <Select
                value={filter?.value as string}
                onValueChange={(value) => handleFilterChange(column.id, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={`Select ${column.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {column.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        return (
          <div key={column.id} className="flex flex-col gap-2">
            <label className="text-sm font-medium">{column.label}</label>
            <Input
              placeholder={`Filter by ${column.label}`}
              value={filter?.value as string}
              onChange={(e) => handleFilterChange(column.id, e.target.value)}
              className="w-[180px]"
            />
          </div>
        );
      })}
    </div>
  );
} 