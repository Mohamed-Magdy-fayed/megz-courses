import * as React from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, useReactTable, RowSelectionState } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { useLastValidValue } from "@/hooks/useLastValidValue";
import { ServerDataTableProps } from "@/components/ui/ServerDataTable/utils/types";
import SumField from "@/components/ui/ServerDataTable/headers/SumField";

export function ServerDataTable<TData, TValue>({
  columns,
  data,
  selectedData,
  totalCount,
  filteredCount,
  setData,
  onDelete,
  handleImport,
  handleExport,
  importConfig,
  exportConfig,
  isLoading,
  error,
  sums,
  dateRanges,
  searches,
  filters,
  isSuperSimple,
  resetSelection,
  columnFilters, setColumnFilters,
  pagination, setPagination,
  sorting, setSorting,
}: ServerDataTableProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const { data: sessionData } = useSession()

  const pageCount = useLastValidValue(Math.ceil(filteredCount / pagination.pageSize))
  const fixedTotalCount = useLastValidValue(totalCount);
  const fixedFilteredCount = useLastValidValue(filteredCount);

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
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount,
    getRowId: (row, index) => ("id" in (row as Record<string, unknown>) ? (row as { id: string }).id : index.toString()),
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
  });

  const handleOpen = () => {
    setOpen(true);
  };

  React.useEffect(() => {
    setData((prev) => {
      const currentSelection = table.getSelectedRowModel().rows.map(row => row.original);
      const selectedIds = new Set(Object.keys(table.getState().rowSelection));
      const updatedSelection = prev.filter(row => selectedIds.has(String((row as Record<string, unknown>).id)));
      const mergedSelection = [...updatedSelection, ...currentSelection.filter(row => !updatedSelection.some(prevRow => (prevRow as Record<string, unknown>).id === (row as Record<string, unknown>).id))];
      return mergedSelection;
    });
  }, [table.getState().rowSelection]);

  React.useEffect(() => {
    setData([])
    table.setRowSelection({})
  }, [resetSelection])

  React.useEffect(() => {
    table.resetPageIndex()
  }, [columnFilters])

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
              <Typography className="whitespace-nowrap">Total records {fixedTotalCount}</Typography>
              <ExportImport isLoading={!!isLoading} handleExport={handleExport} selectedData={selectedData} data={data} exportConfig={exportConfig} handleImport={handleImport} importConfig={importConfig} />
            </div>
            <div className="w-full flex flex-col gap-2 items-center md:flex-row md:gap-4 md:justify-end">
              <PaginationPageSizeSelectors
                isLoading={!!isLoading}
                pageSize={pagination.pageSize || 10}
                setPageSize={table.setPageSize}
                options={
                  fixedFilteredCount > 100 ? [10, 50, 100]
                    : fixedFilteredCount > 50 ? [10, 50]
                      : [10]
                }
              />
              <PaginationNavigation table={table} />
            </div>
          </div>
        )}
        {table.getAllColumns().some(col => !!col.getFilterValue()) && (
          <Typography className="px-4 pb-4 text-sm text-muted">
            {fixedFilteredCount} of{" "}
            {fixedTotalCount} row(s) filtered.
          </Typography>
        )}
        {selectedData.length > 0 && (
          <div className="flex w-full flex-1 justify-between px-4 pb-4 text-sm text-muted">
            <Typography>
              {selectedData.length} of{" "}
              {fixedFilteredCount} row(s) selected.
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
                const currentSum = sums?.find(sum => sum.key === header.id)

                return (
                  <TableHead className="px-2" key={header.id}>
                    <div className="flex items-center gap-2 justify-between text-foreground">
                      {currentSearch ? (
                        <SearchField header={header} table={table} currentSearch={currentSearch} />
                      ) : currentFilter ? (
                        <FilterField currentFilter={currentFilter} header={header} table={table} />
                      ) : currentDateFilter
                        ? (
                          <DateRangeField currentDateFilter={currentDateFilter} header={header} table={table} />
                        ) : currentSum
                          ? (
                            <SumField table={table} currentSummedField={currentSum} />
                          )
                          : header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )
                      }
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
