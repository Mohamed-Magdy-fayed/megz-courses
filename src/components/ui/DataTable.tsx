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
import {
  Box,
  Button,
  Icon,
  IconButton,
  InputAdornment,
  InputBase,
  Typography,
} from "@mui/material";
import { ArrowLeft, ArrowRight, Delete, Search } from "@mui/icons-material";
import { AlertModal } from "../modals/AlertModal";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setUsers: (users: TData[]) => void;
  onDelete: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setUsers,
  onDelete,
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
    setUsers(table.getSelectedRowModel().rows.map((row) => row.original));
  };

  return (
    <div>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          onDelete();
          setOpen(false);
        }}
        loading={loading}
      />
      <Box component="div" className="p-4">
        <InputBase
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          fullWidth
          placeholder="Search Students"
          className="hover:shadow-0 rounded-full p-2 text-sm font-medium leading-6 outline-none outline-1 outline-offset-0 outline-slate-300 focus-within:!bg-white focus-within:outline-2 focus-within:outline-primary hover:bg-slate-100"
          startAdornment={
            <InputAdornment position="start">
              <Icon color="action">
                <Search />
              </Icon>
            </InputAdornment>
          }
        />
      </Box>
      <div className="whitespace-nowrap">
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="flex w-full flex-1 justify-between px-4 pb-4 text-sm text-muted-foreground">
            <Typography>
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </Typography>
            <IconButton onClick={handleOpen} color="warning">
              <Delete />
            </IconButton>
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="contained"
          size="small"
          className="bg-primary"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ArrowLeft></ArrowLeft>
        </Button>
        <Button
          variant="contained"
          size="small"
          className="bg-primary"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ArrowRight></ArrowRight>
        </Button>
      </div>
    </div>
  );
}
