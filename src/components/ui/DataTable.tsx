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
import { ArrowLeft, ArrowRight, SortAsc, SortDesc, Trash } from "lucide-react";
import { TableInput } from "@/components/ui/table-input";
import TableSelectField from "@/components/ui/TableSelectField";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { formatPrice } from "@/lib/utils";
import Spinner from "@/components/Spinner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setData: (data: TData[]) => void;
  onDelete?: (callback?: () => void) => void;
  skele?: boolean,
  sum?: {
    key: Extract<keyof TData, string>,
    label: string,
  };
  dateRange?: {
    key: Extract<keyof TData, string>,
    label: string,
  };
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
  skele,
  sum,
  dateRange,
  searches,
  filters,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
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
  const [startDate, setStartDate] = React.useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date())

  const handleOpen = () => {
    setOpen(true);
    setData(table.getSelectedRowModel().rows.map((row) => row.original));
  };

  // const handleExportPDF = () => {
  //   const pdf = new jsPDF({ format: "a4", unit: "pt", orientation: "portrait" });

  //   const dataToExport = table.getSelectedRowModel().rows.length > 0 ? table.getSelectedRowModel().rows
  //     : table.getFilteredRowModel().rows.length > 0 ? table.getFilteredRowModel().rows
  //       : table.getCoreRowModel().rows

  //   // Add table headers
  //   const headers = exportData?.map(({ key }) => key) || []; // Array of header keys

  //   const content = dataToExport.map(row => {
  //     const rowData: { [key: string]: string } = {};

  //     // Iterate over the headers to ensure all keys are included in rowData
  //     exportData?.forEach(col => {
  //       // Assign the corresponding value or an empty string if it's missing
  //       rowData[col.key] = row.original[col.key] as string ?? ''; // Fallback to empty string
  //     });

  //     return rowData;
  //   });

  //   // Convert the header and content arrays into a format jsPDF accepts
  //   const image = new Image()
  //   image.src = "/logos/logoPrimary.png"
  //   image.onload = () => {
  //     pdf.addImage(image, "", 20, 20, 50, 50)

  //     addAlignedText({
  //       pdf,
  //       fontSize: 20,
  //       text: exportName || "",
  //       yPosition: 50,
  //       alignment: "center",
  //       underline: true,
  //     })

  //     addAlignedText({
  //       pdf,
  //       fontSize: 10,
  //       text: format(new Date(), "PPPPp"),
  //       yPosition: 10,
  //       alignment: "right",
  //       rightMargin: 20
  //     })

  //     pdf.table(40, 90, content, headers, { padding: 5 });
  //     pdf.save(`${exportName}.pdf`);
  //   };
  // };

  return (
    <div className="w-full">
      {/* {table.getCoreRowModel().rows.length !== 0 && (
        <>
        <div className="flex items-center gap-2 p-2">
        <Typography variant={"secondary"}>Export</Typography>
        <Tooltip>
        <TooltipTrigger asChild>
        <Button
        onClick={handleExportPDF}
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
        )} */}
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
        {table.getAllColumns().some(col => !!col.getFilterValue()) && (
          <Typography className="px-4 pb-4 text-sm text-muted">
            {table.getFilteredRowModel().rows.length} of{" "}
            {table.getCoreRowModel().rows.length} row(s) filtered.
          </Typography>
        )}
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
                            placeholder={searches?.find(s => s.key === header.id)?.label}
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
                                    <Typography>
                                      {
                                        table.getFilteredRowModel().rows.length > 0
                                          ? table.getFilteredRowModel().rows.filter(row => row.original[filters.find(f => f.key === header.id)?.key as Extract<keyof TData, string>] === val.value).length
                                          : table.getCoreRowModel().rows.filter(row => row.original[filters.find(f => f.key === header.id)?.key as Extract<keyof TData, string>] === val.value).length
                                      }
                                    </Typography>
                                  </div>
                                )
                              })) || []}
                              listTitle={header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              placeholder={filters.find(f => f.key === header.id)?.filterName || ""}
                              handleChange={(val) => {
                                const isSameFilter = table.getColumn(header.id)?.getFilterValue() === val
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
                      ) : dateRange?.key === header.id
                        ? (
                          <div className="flex gap-2 items-center justify-between">
                            <DateRangePicker
                              label={dateRange.label}
                              handleReset={() => {
                                const col = table.getColumn(dateRange.key)
                                col?.setFilterValue(undefined)
                              }}
                              handleChange={() => {
                                if (!startDate && !endDate) {
                                  const col = table.getColumn(dateRange.key)
                                  col?.setFilterValue(undefined)
                                  return
                                }

                                if (!startDate && endDate) {
                                  const newStartDate = new Date(endDate.getTime())
                                  newStartDate.setHours(0, 0, 0)
                                  const newEndDate = new Date(endDate.getTime())
                                  newEndDate.setHours(23, 59, 59)
                                  const col = table.getColumn(dateRange.key)
                                  col?.setFilterValue(`${newStartDate}|${newEndDate}`)
                                  return
                                }

                                if (!endDate && startDate) {
                                  const newStartDate = new Date(startDate.getTime())
                                  newStartDate.setHours(0, 0, 0)
                                  const newEndDate = new Date(startDate.getTime())
                                  newEndDate.setHours(23, 59, 59)
                                  const col = table.getColumn(dateRange.key)
                                  col?.setFilterValue(`${newStartDate}|${newEndDate}`)
                                  return
                                }

                                if (startDate === endDate) {
                                  const newStartDate = new Date(startDate?.getTime()!);
                                  newStartDate.setHours(0, 0, 0);
                                  const newEndDate = new Date(endDate?.getTime()!)
                                  newEndDate.setHours(23, 59, 59)

                                  const col = table.getColumn(dateRange.key)
                                  col?.setFilterValue(`${newStartDate}|${newEndDate}`)
                                  return
                                }

                                const newStartDate = new Date(startDate?.getTime()!);
                                newStartDate.setHours(0, 0, 0);
                                const newEndDate = new Date(endDate?.getTime()!)
                                newEndDate.setHours(23, 59, 59)

                                const col = table.getColumn(dateRange.key)
                                col?.setFilterValue(`${newStartDate}|${newEndDate}`)
                                return
                              }}
                              startDate={startDate}
                              setStartDate={setStartDate}
                              endDate={endDate}
                              setEndDate={setEndDate}
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
                        ) : header.id === sum?.key
                          ? (
                            <div className="flex items-center gap-4">
                              <Typography className="text-muted">{sum.label}</Typography>
                              <Typography className="text-muted">
                                {formatPrice(table.getFilteredSelectedRowModel().rows.length > 0 ? table.getFilteredSelectedRowModel().rows.map(r => r.original[sum.key]).reduce((a, b) => {
                                  return Number(a) + Number(b)
                                }, 0) : table.getFilteredRowModel().rows.map(r => r.original[sum.key]).reduce((a, b) => {
                                  return Number(a) + Number(b)
                                }, 0))}
                              </Typography>
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
                          )
                          : header.isPlaceholder
                            ? null
                            : (
                              <Typography className="text-muted">
                                {
                                  flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )
                                }
                              </Typography>
                            )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className={skele ? "bg-muted/20 animate-pulse" : ""}>
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
            ) : skele ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24"
                >
                  <div className="flex w-fit mx-auto items-center gap-2">
                    <Typography>Loading...</Typography><Spinner className="w-4 h-4" />
                  </div>
                </TableCell>
              </TableRow>
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
