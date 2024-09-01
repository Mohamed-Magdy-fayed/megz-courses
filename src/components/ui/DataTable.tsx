import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertModal } from "../modals/AlertModal";
import { Typography } from "./Typoghraphy";
import { Button } from "./button";
import { ArrowLeft, ArrowRight, FileUp, SortAsc, SortDesc, Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { csvMaker } from "@/lib/csvMaker";
import { Separator } from "@/components/ui/separator";
import { TableInput } from "@/components/ui/table-input";
import { upperFirst } from "lodash";
import TableSelectField from "@/components/ui/TableSelectField";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setData: (data: TData[]) => void;
  onDelete?: (callback?: () => void) => void;
  searches?: {
    key: Extract<keyof TData, string>,
    label: string,
  }[];
  filters?: {
    filterName: string
    values: { label: string, value: (Extract<TData[keyof TData], string>) }[]
    key: Extract<keyof TData, string>
  }[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setData,
  onDelete,
  searches,
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
    <div className="w-full">
      {table.getCoreRowModel().rows.length !== 0 && (
        <>
          <div className="flex items-center gap-2 p-2">
            <Typography variant={"secondary"}>Export</Typography>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => csvMaker(table.getSelectedRowModel().rows.length > 0 ? table.getSelectedRowModel().rows.map(row => row.original) : table.getCoreRowModel().rows.map(row => row.original))}
                  variant={"icon"}
                  customeColor={"infoIcon"}
                >
                  <FileUp />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <Typography>Export</Typography>
              </TooltipContent>
            </Tooltip>
          </div>
          <Separator />
        </>
      )}
      {onDelete && <AlertModal
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
      />}
      <div className="whitespace-nowrap grid">
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="flex w-full flex-1 justify-between px-4 pb-4 text-sm text-muted">
            <Typography>
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </Typography>
            {onDelete && <Button variant={"icon"} onClick={handleOpen} customeColor={"destructiveIcon"}>
              <Trash />
            </Button>}
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="py-2" key={header.id}>
                      {searches?.some(s => s.key === header.id) ? (
                        <div className="flex items-center gap-2 justify-between">
                          <TableInput
                            placeholder={upperFirst(header.id)}
                            value={(table.getColumn(header.id)?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                              table.getColumn(header.id)?.setFilterValue(event.target.value)
                            }
                          />
                          <Button
                            className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
                            onClick={() => table.getColumn(header.id)?.toggleSorting(table.getColumn(header.id)?.getIsSorted() === "asc")}
                          >
                            {table.getColumn(header.id)?.getIsSorted() === "asc" ? (
                              <SortAsc className="h-4 w-4 text-primary" />
                            ) : (
                              <SortDesc className="h-4 w-4 text-primary" />
                            )}
                          </Button>
                        </div>
                      ) : filters?.some(f => f.key === header.id) ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <TableSelectField
                              data={filters.find(f => f.key === header.id)?.values.map(val => ({
                                active: true,
                                label: val.label,
                                value: val.value,
                                customLabel: (
                                  <div className="flex items-center justify-between gap-4 w-full">
                                    <Typography>{val.label}</Typography>
                                    <Typography>{table.getCoreRowModel().rows.filter(row => row.original[filters.find(f => f.key === header.id)?.key as Extract<keyof TData, string>] === val.value).length}</Typography>
                                  </div>
                                )
                              })) || []}
                              listTitle={header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              placeholder={upperFirst(header.id)}
                              handleChange={(val) => {
                                const isSameFilter = table.getColumn(header.id)?.getFilterValue() === val
                                console.log("isSameFilter", isSameFilter);
                                console.log("item", val);
                                table.getColumn(header.id)?.setFilterValue(isSameFilter ? "" : val)
                              }}
                            />
                            <Button
                              className="w-fit rounded-full p-1 h-6 bg-transparent hover:bg-transparent"
                              onClick={() => table.getColumn(header.id)?.toggleSorting(table.getColumn(header.id)?.getIsSorted() === "asc")}
                            >
                              {table.getColumn(header.id)?.getIsSorted() === "asc" ? (
                                <SortAsc className="h-4 w-4 text-primary" />
                              ) : (
                                <SortDesc className="h-4 w-4 text-primary" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : header.isPlaceholder
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
      {
        data.length > 10 && (
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
        )
      }
    </div >
  );
}
