import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  filterFns,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertModal } from "../modals/AlertModal";
import { Input } from "./input";
import { Typography } from "./Typoghraphy";
import { Button } from "./button";
import { ArrowLeft, ArrowRight, CheckCircle, Trash } from "lucide-react";
import { SeverityPill } from "../overview/SeverityPill";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setData: (data: TData[]) => void;
  onDelete: (callback?: () => void) => void;
  search?: {
    label: string
    key: Extract<keyof TData, string>
  }
  filters?: {
    label: string
    values: (Extract<TData[keyof TData], string>)[]
    key: Extract<keyof TData, string>
  }[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setData,
  onDelete,
  search,
  filters,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
    setData(table.getSelectedRowModel().rows.map((row) => row.original));
  };

  return (
    <div>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setLoading(true)
          onDelete(() => {
            table.toggleAllPageRowsSelected(false)
            setOpen(false);
            setLoading(false)
          });
        }}
        loading={loading}
      />
      {search && (
        <div className="p-4">
          <Input
            value={(table.getColumn(search.key)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(search.key)?.setFilterValue(event.target.value)
            }
            placeholder={`Search by ${search.label}`}
            className="w-full hover:shadow-0 rounded-full p-2 text-sm font-medium leading-6 outline-none outline-1 outline-offset-0 outline-slate-300 focus-within:!bg-white focus-within:outline-2 focus-within:outline-primary hover:bg-slate-100"
          />
        </div>
      )}
      {filters && (
        <div className="p-4 flex flex-col gap-2">
          <Typography>Filter by</Typography>
          {filters.map(filter => (
            <div key={filter.key} className="flex items-center gap-4">
              {filter.values.map((value, i) => (
                <div key={`${value}filters${i}`} className="flex items-center gap-4">
                  <Button
                    onClick={() => {
                      const isSameFilter = table.getColumn(filter.key)?.getFilterValue() === value
                      table.getColumn(filter.key)?.setFilterValue(isSameFilter ? "" : value)
                    }}
                    placeholder={`Filter by ${filter.label}`}
                    customeColor={table.getColumn(filter.key)?.getFilterValue() as string === value ? "primary" : "accent"}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <Typography>{value}</Typography>
                  </Button>
                  {i === filter.values.length - 1 && <SeverityPill color="info" className="aspect-square">{table.getRowModel().rows.length}</SeverityPill>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="whitespace-nowrap grid">
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="flex w-full flex-1 justify-between px-4 pb-4 text-sm text-muted">
            <Typography>
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </Typography>
            <Button variant={"icon"} onClick={handleOpen} customeColor={"destructiveIcon"}>
              <Trash />
            </Button>
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data.length > 10 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            className="bg-primary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft></ArrowLeft>
          </Button>
          <Button
            className="bg-primary"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ArrowRight></ArrowRight>
          </Button>
        </div>
      )}
    </div>
  );
}
