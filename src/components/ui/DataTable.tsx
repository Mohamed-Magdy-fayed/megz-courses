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
  PaginationState,
  Updater,
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
import { Button, SpinnerButton } from "./button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, DownloadCloud, SortAsc, SortDesc, Trash, Upload, UploadCloud } from "lucide-react";
import { TableInput } from "@/components/ui/table-input";
import TableSelectField from "@/components/ui/TableSelectField";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { cn, formatPrice } from "@/lib/utils";
import Spinner from "@/components/Spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Modal from "@/components/ui/modal";
import { Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";
import { downloadTemplate, exportToExcel, importFromExcel } from "@/lib/xlsx";
import { useDropFile } from "@/hooks/useDropFile";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

type Cursor = Prisma.UserFindManyArgs["cursor"]
type OrderBy = Prisma.UserFindManyArgs["orderBy"]
type Skip = Prisma.UserFindManyArgs["skip"]
type Take = Prisma.UserFindManyArgs["take"]

export type QueryArgs = {
  cursor?: Cursor;
  orderBy?: OrderBy;
  skip?: Skip;
  take?: Take;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setData: (data: TData[]) => void;
  onDelete?: (callback?: () => void) => void;
  handleImport?: (data: { [key in Extract<keyof TData, string>]: string }[]) => void;
  importConfig?: {
    templateName: string;
    sheetName: string;
    reqiredFields: Extract<keyof TData, string>[]
  },
  exportConfig?: {
    fileName: string;
    sheetName: string;
  },
  skele?: boolean,
  sum?: {
    key: Extract<keyof TData, string>,
    label: string,
  };
  dateRanges?: {
    key: Extract<keyof TData, string>,
    label: string,
  }[];
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
  handleImport,
  importConfig,
  exportConfig,
  skele,
  sum,
  dateRanges,
  searches,
  filters,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isExportOpen, setIsExportOpen] = React.useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = React.useState<boolean>(false);
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
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
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

  const { data: sessionData } = useSession()
  const { toast } = useToast()
  const {
    isDragActive,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileChange,
    setSelectedFile,
    selectedFile,
  } = useDropFile();
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="w-full">
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
      <div className="flex items-center justify-between gap-4">
        {sessionData?.user.userType !== "student" && (
          <div className="flex items-center gap-8">
            <Typography>Total records {table.getCoreRowModel().rows.length}</Typography>
            {exportConfig && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={"icon"} customeColor={"mutedIcon"} onClick={() => exportToExcel(data, exportConfig.fileName, exportConfig.sheetName)}>
                    <DownloadCloud className="text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Export
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={"icon"} customeColor={"mutedIcon"} onClick={() => setIsImportOpen(true)}>
                  <UploadCloud className="text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Import
              </TooltipContent>
            </Tooltip>
            <Modal
              title="Import Data"
              description="Select a file to import"
              isOpen={isImportOpen}
              onClose={() => setIsImportOpen(false)}
              children={
                !importConfig ? (
                  <div className="flex flex-col items-center gap-4 p-8">
                    <Typography>No import configuration</Typography>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 p-4">
                    <div
                      onClick={() => inputRef.current?.click()}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={cn("border-dashed border-2 border-primary p-8 text-center w-full", isDragActive ? "bg-primary-foreground" : "bg-muted/10")}
                    >
                      <Input
                        ref={inputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="fileInput"
                      />
                      <Typography>
                        {isDragActive
                          ? 'Drop your files here...'
                          : 'Drag and drop files here, or click to select file'}
                      </Typography>

                      {!!selectedFile && (
                        <div>
                          <Typography variant={"secondary"}>Selected File:</Typography>
                          <Typography>{selectedFile.name}</Typography>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <SpinnerButton
                        customeColor={"info"}
                        loadingText="Downloading"
                        icon={Download}
                        isLoading={false}
                        onClick={() => downloadTemplate(importConfig)}
                        text="Download Template"
                      />

                      <SpinnerButton
                        loadingText="Importing..."
                        icon={Upload}
                        isLoading={false}
                        onClick={() => {
                          if (!selectedFile) return toast({ title: "Error", description: "No file selected!", variant: "destructive" })
                          if (!handleImport) return toast({ title: "Error", description: "No import configured!", variant: "destructive" })
                          importFromExcel(selectedFile, handleImport)
                          setSelectedFile(undefined)
                          if (inputRef.current) {
                            inputRef.current.value = ""
                          }
                          setIsImportOpen(false)
                        }}
                        text="Import Data"
                      />
                    </div>
                  </div>
                )
              }
            />
          </div>
        )}
        <div className="flex flex-col gap-2 justify-center">
          {table.getPageCount() === 0 ? null : table.getPageCount() === 1 ? null : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 justify-center w-full">
                <Typography>Page</Typography>
                <Typography>{pagination.pageIndex + 1}</Typography>
                <Typography>of</Typography>
                <Typography>{table.getPageCount()}</Typography>
                <Typography>Pages</Typography>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-primary h-4 w-8 p-0"
                  onClick={() => table.setPageIndex(0)}
                  disabled={pagination.pageIndex === 0}
                >
                  <ChevronsLeft className="w-4" />
                </Button>
                <Button
                  className="bg-primary h-4 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="w-4" />
                </Button>
                <PaginationPageSelectors
                  pageCount={table.getPageCount()}
                  setPageIndex={table.setPageIndex}
                  currentPage={table.getState().pagination.pageIndex}
                />
                <Button
                  className="bg-primary h-4 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="w-4" />
                </Button>
                <Button
                  className="bg-primary h-4 w-8 p-0"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 justify-center w-full">
                <PaginationPageSizeSelectors
                  pageSize={10}
                  setPageSize={table.setPageSize}
                  options={
                    table.getCoreRowModel().rows.length > 100 ? [5, 10, 50, 100]
                      : table.getCoreRowModel().rows.length > 50 ? [5, 10, 50]
                        : table.getCoreRowModel().rows.length > 10 ? [5, 10]
                          : table.getCoreRowModel().rows.length > 5 ? [5] : []
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
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
                                : (
                                  <div className="flex items-center justify-between">
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                                    <Typography className="text-info">
                                      {table.getCoreRowModel().rows.length}
                                    </Typography>
                                  </div>
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
                      ) : dateRanges?.some(dr => dr.key === header.id)
                        ? (
                          <div className="flex gap-2 items-center justify-between">
                            <DateRangePicker
                              label={dateRanges.find(dr => dr.key === header.id)?.label || "No Label"}
                              handleReset={() => {
                                const col = table.getColumn(header.id)
                                col?.setFilterValue(undefined)
                              }}
                              handleChange={() => {
                                if (!startDate && !endDate) {
                                  const col = table.getColumn(header.id)
                                  col?.setFilterValue(undefined)
                                  return
                                }

                                if (!startDate && endDate) {
                                  const newStartDate = new Date(endDate.getTime())
                                  newStartDate.setHours(0, 0, 0)
                                  const newEndDate = new Date(endDate.getTime())
                                  newEndDate.setHours(23, 59, 59)
                                  const col = table.getColumn(header.id)
                                  col?.setFilterValue(`${newStartDate}|${newEndDate}`)
                                  return
                                }

                                if (!endDate && startDate) {
                                  const newStartDate = new Date(startDate.getTime())
                                  newStartDate.setHours(0, 0, 0)
                                  const newEndDate = new Date(startDate.getTime())
                                  newEndDate.setHours(23, 59, 59)
                                  const col = table.getColumn(header.id)
                                  col?.setFilterValue(`${newStartDate}|${newEndDate}`)
                                  return
                                }

                                if (startDate === endDate) {
                                  const newStartDate = new Date(startDate?.getTime()!);
                                  newStartDate.setHours(0, 0, 0);
                                  const newEndDate = new Date(endDate?.getTime()!)
                                  newEndDate.setHours(23, 59, 59)

                                  const col = table.getColumn(header.id)
                                  col?.setFilterValue(`${newStartDate}|${newEndDate}`)
                                  return
                                }

                                const newStartDate = new Date(startDate?.getTime()!);
                                newStartDate.setHours(0, 0, 0);
                                const newEndDate = new Date(endDate?.getTime()!)
                                newEndDate.setHours(23, 59, 59)

                                const col = table.getColumn(header.id)
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
    </div>
  );
}

export interface PaginationPageSelectorsProps {
  pageCount: number;
  setPageIndex: (index: number) => void;
  currentPage: number;
}

export const PaginationPageSelectors: React.FC<PaginationPageSelectorsProps> = ({ pageCount, setPageIndex, currentPage }) => {
  const maxPages = 5;
  const middleIndex = Math.floor(maxPages / 2);

  // Determine the range of visible pages
  const startPage = Math.max(0, Math.min(pageCount - maxPages, currentPage - middleIndex));
  const visiblePages = Array.from({ length: Math.min(maxPages, pageCount) }, (_, i) => startPage + i);

  return (
    <div className="flex items-center gap-2 px-4">
      {visiblePages.map(i => (
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          customeColor={i === currentPage ? "primary" : "primaryOutlined"}
          className="h-4 w-8 p-0 transition-all duration-100"
          onClick={() => setPageIndex(i)}
        >
          {i + 1}
        </Button>
      ))}
    </div>
  );
};

export interface PaginationPageSizeSelectorsProps {
  pageSize: number;
  options: number[];
  setPageSize: (updater: Updater<number>) => void
}

export const PaginationPageSizeSelectors: React.FC<PaginationPageSizeSelectorsProps> = ({ setPageSize, options }) => {
  const [localPageSize, setLocalPageSize] = React.useState(10)

  return (
    <div className="flex flex-col items-center gap-2 px-4">
      <Typography>Page Size</Typography>
      <div className="flex items-center gap-2 px-4">
        {options.map(item => (
          <Button
            key={`${item}DataTablePageSize`}
            variant={item === localPageSize ? "default" : "outline"}
            customeColor={item === localPageSize ? "primary" : "primaryOutlined"}
            className="h-4 w-8 p-0 transition-all duration-100"
            onClick={() => {
              setPageSize(item)
              setLocalPageSize(item)
            }}
          >
            {item}
          </Button>
        ))}
      </div>
    </div>
  );
};

export const ExportForm = ({ setQueryProps, pagination }: {
  pagination: PaginationState;
  setQueryProps: React.Dispatch<React.SetStateAction<{
    cursor?: Cursor;
    orderBy?: OrderBy;
    skip?: Skip;
    take?: Take;
  }>>
}) => {
  return (
    <div>
      Content
      <Button onClick={() => {
        setQueryProps({
          take: pagination.pageSize,
          skip: (pagination.pageIndex + 1) * pagination.pageSize,
          orderBy: { createdAt: "asc" },
        })
      }}>
        setQueryProps
      </Button>
    </div>
  )
}
