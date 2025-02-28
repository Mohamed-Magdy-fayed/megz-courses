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
import { useSession } from "next-auth/react";
import { downloadTemplate, exportToExcel, importFromExcel } from "@/lib/exceljs";
import { useDropFile } from "@/hooks/useDropFile";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { hasPermission } from "@/server/permissions";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import { FetchNextPageOptions, FetchPreviousPageOptions, InfiniteQueryObserverResult } from "@tanstack/react-query";
import { getProperty, NestedKey } from "@/lib/dataTableUtils";
import { api } from "@/lib/api";

interface DataTableQueriedProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  setData: (data: TData[]) => void;
  onDelete?: (callback?: () => void) => void;
  handleImport?: (data: TData[]) => void;
  importConfig?: {
    templateName: string;
    sheetName: string;
    reqiredFields: NestedKey<TData>[]
    extraDetails?: React.ReactNode;
  },
  exportConfig?: {
    fileName: string;
    sheetName: string;
  },
  sum?: {
    key: NestedKey<TData>,
    label: string,
  };
  dateRanges?: {
    key: NestedKey<TData>,
    label: string,
  }[];
  searches?: {
    key: NestedKey<TData>,
    label: string,
  }[];
  filters?: {
    filterName: string
    values: { label: string, value: (NestedKey<TData>) }[]
    key: NestedKey<TData>
  }[];
  isSuperSimple?: boolean;
  resetSelection?: boolean;
}

export function DataTableQueried<TData, TValue>({
  columns,
  setData,
  onDelete,
  handleImport,
  importConfig,
  exportConfig,
  sum,
  dateRanges,
  searches,
  filters,
  isSuperSimple,
  resetSelection,
}: DataTableQueriedProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isImportOpen, setIsImportOpen] = React.useState<boolean>(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const {
    data,
    fetchNextPage,
    isLoading,
    isFetching,
  } = api.leads.queryLeads.useInfiniteQuery(
    { limit: pagination.pageSize },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  React.useEffect(() => {
    if (data && data.pages.length < pagination.pageIndex + 1) {
      fetchNextPage()
    }
  }, [data?.pages.length, pagination.pageIndex])

  const table = useReactTable({
    data: data?.pages.flatMap(page => page.rows) as TData[] || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    rowCount: data?.pages[0]?.totalCount || 0,
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


  React.useEffect(() => setData(table.getSelectedRowModel().rows.map(row => row.original)), [rowSelection])
  React.useEffect(() => {
    setData([])
    table.setRowSelection({})
  }, [resetSelection])

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
      <div className="flex flex-col py-4 lg:flex-row lg:py-0 items-center justify-between gap-4">
        {sessionData?.user && hasPermission(sessionData?.user, "adminLayout", "view") && !isSuperSimple && (
          <div className="flex items-center gap-8">
            <Typography>Total records {table.getRowCount()}</Typography>
            {exportConfig && (
              <WrapWithTooltip text="Export">
                <Button
                  variant={"icon"}
                  customeColor={"mutedIcon"}
                  onClick={() => {
                    const rows = table.getFilteredSelectedRowModel().rows.length === 0 ? table.getFilteredRowModel().rows : table.getFilteredSelectedRowModel().rows
                    const exportData = rows.map(r => r.original)
                    console.log(exportData);

                    exportToExcel(
                      exportData,
                      exportConfig.fileName,
                      exportConfig.sheetName
                    )
                  }}>
                  <DownloadCloud className="text-primary" />
                </Button>
              </WrapWithTooltip>
            )}
            {importConfig && (
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
            )}
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
                    {!!importConfig.extraDetails && importConfig.extraDetails}
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
                    table.getRowCount() > 100 ? [5, 10, 50, 100]
                      : table.getRowCount() > 50 ? [5, 10, 50]
                        : table.getRowCount() > 10 ? [5, 10]
                          : table.getRowCount() > 5 ? [5] : []
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
                  const currentFilter = filters?.find(f => f.key === header.id)

                  return (
                    <TableHead className="px-2" key={header.id}>
                      {searches?.some(s => s.key === header.id || s.key.replace(".", "_") === header.id) ? (
                        <div className="flex items-center gap-2 justify-between">
                          <TableInput
                            placeholder={searches?.find(s => s.key === header.id || s.key.replace(".", "_") === header.id)?.label}
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
                      ) : currentFilter ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <TableSelectField
                              data={currentFilter.values.map(val => ({
                                Active: true,
                                label: val.label,
                                value: val.value,
                                customLabel: (
                                  <div className="flex items-center justify-between gap-4 w-full">
                                    <Typography>{val.label}</Typography>
                                    <Typography>
                                      {
                                        table.getFilteredRowModel().rows.length > 0
                                          ? table.getFilteredRowModel().rows.filter(row => getProperty(row.original, currentFilter.key.replace("_", ".") as keyof TData) === val.value).length
                                          : table.getCoreRowModel().rows.filter(row => getProperty(row.original, currentFilter.key.replace("_", ".") as keyof TData) === val.value).length
                                      }
                                    </Typography>
                                  </div>
                                )
                              })) || []}
                              listTitle={header.isPlaceholder
                                ? null
                                : (
                                  <div className="flex items-center justify-between">
                                    <Typography>{currentFilter.filterName}</Typography>
                                    <Typography className="text-info">
                                      {table.getCoreRowModel().rows.length}
                                    </Typography>
                                  </div>
                                )}
                              placeholder={currentFilter.filterName || ""}
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
                                {formatPrice(table.getFilteredSelectedRowModel().rows.length > 0 ? table.getFilteredSelectedRowModel().rows.map(r => getProperty(r.original, sum.key.replace("_", ".") as keyof TData)).reduce((a, b) => {
                                  return Number(a) + Number(b)
                                }, 0) : table.getFilteredRowModel().rows.map(r => getProperty(r.original, sum.key.replace("_", ".") as keyof TData)).reduce((a, b) => {
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
          <TableBody className={isLoading ? "bg-muted/20 animate-pulse" : ""}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-1 px-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isLoading || isFetching ? (
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
            key={`${item}DataTableQueriedPageSize`}
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
