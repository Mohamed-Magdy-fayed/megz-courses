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
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertModal } from "../general/modals/AlertModal";
import { Typography } from "./Typoghraphy";
import { Button } from "./button";
import { TrashIcon } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/server/permissions";
import ExportImport from "@/components/ui/ServerDataTable/ExportImport";
import SearchField from "@/components/ui/ServerDataTable/headers/SearchField";
import FilterField from "@/components/ui/ServerDataTable/headers/FilterField";
import DateRangeField from "@/components/ui/ServerDataTable/headers/DateRangeField";
import { cn, formatPrice } from "@/lib/utils";
import SortButton from "@/components/ui/ServerDataTable/headers/SortButton";
import PaginationNavigation from "@/components/ui/ServerDataTable/PaginationNavigation";
import PaginationPageSizeSelectors from "@/components/ui/ServerDataTable/PaginationPageSizeSelectors";
import { StringKeyOf, StringValueOf } from "@/components/ui/ServerDataTable/utils/types";
import SumField from "@/components/ui/ServerDataTable/headers/SumField";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setData: (data: TData[]) => void;
  onDelete?: (callback?: () => void) => void;
  handleImport?: (data: TData[]) => void;
  importConfig?: {
    templateName: string;
    sheetName: string;
    reqiredFields: StringKeyOf<TData>[]
    extraDetails?: React.ReactNode;
  },
  exportConfig?: {
    fileName: string;
    sheetName: string;
    fields?: StringKeyOf<TData>[];
  },
  isLoading?: boolean,
  error?: string,
  sum?: {
    key: StringKeyOf<TData>,
    label: string,
    isNegative?: boolean,
  };
  dateRanges?: {
    key: StringKeyOf<TData>,
    label: string,
  }[];
  searches?: {
    key: StringKeyOf<TData>,
    label: string,
  }[];
  filters?: {
    filterName: string
    values: { label: string, value: (StringValueOf<TData>) }[]
    key: StringKeyOf<TData>
  }[];
  isSuperSimple?: boolean;
  resetSelection?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setData,
  onDelete,
  handleImport,
  importConfig,
  exportConfig,
  isLoading,
  error,
  sum,
  dateRanges,
  searches,
  filters,
  isSuperSimple,
  resetSelection,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
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
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
  });

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
    setData(table.getSelectedRowModel().rows.map((row) => row.original));
  };

  const { data: sessionData } = useSession()

  React.useEffect(() => setData(table.getSelectedRowModel().rows.map(row => row.original)), [rowSelection])
  React.useEffect(() => {
    setData([])
    table.setRowSelection({})
  }, [resetSelection])

  return (
    <div className="w-full space-y-4">
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
        {sessionData?.user && hasPermission(sessionData?.user, "adminLayout", "view") && !isSuperSimple && (
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex flex-col items-center gap-2 md:flex-row md:justify-start md:gap-4">
              <Typography className="whitespace-nowrap">Total records {table.getRowCount()}</Typography>
              <ExportImport<TData> data={data} exportConfig={exportConfig} handleImport={handleImport} importConfig={importConfig} isLoading={!!isLoading} />
            </div>
            <div className="w-full flex flex-col gap-2 items-center md:flex-row md:gap-4 md:justify-end">
              <PaginationPageSizeSelectors
                isLoading={!!isLoading}
                pageSize={pagination.pageSize || 10}
                setPageSize={table.setPageSize}
                options={
                  table.getFilteredRowModel().rows.length > 100 ? [10, 50, 100]
                    : table.getFilteredRowModel().rows.length > 50 ? [10, 50]
                      : [10]
                }
              />
              <PaginationNavigation table={table} />
            </div>
          </div>
        )}
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
              <TrashIcon />
            </Button>}
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const currentSearch = searches?.find(f => f.key === header.id)
                const currentFilter = filters?.find(f => f.key === header.id)
                const currentDateFilter = dateRanges?.find(dr => dr.key === header.id)

                return (
                  <TableHead className="px-2" key={header.id}>
                    <div className="flex items-center gap-2 justify-between text-foreground whitespace-nowrap">
                      {currentSearch ? (
                        <SearchField header={header} table={table} currentSearch={currentSearch} />
                      ) : currentFilter ? (
                        <FilterField currentFilter={currentFilter} header={header} table={table} />
                      ) : currentDateFilter
                        ? (
                          <DateRangeField currentDateFilter={currentDateFilter} header={header} table={table} />
                        ) : header.id === sum?.key
                          ? (
                            <SumField table={table} currentSummedField={sum} />
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
                      {header.column.getCanSort() && <SortButton setSorting={setSorting} header={header} />}
                    </div>
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
          ) : isLoading ? (
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
          ) : error ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                {error}
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
  );
}
