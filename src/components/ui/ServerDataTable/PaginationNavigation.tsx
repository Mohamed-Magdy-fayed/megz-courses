import { Table } from "@tanstack/react-table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export default function PaginationNavigation<TData>({
    table,
}: { table: Table<TData>; }) {
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious disabled={table.getState().pagination.pageIndex === 0} onClick={() => table.previousPage()} />
                </PaginationItem>
                {table.getState().pagination.pageIndex + 1 >= 4 && (
                    <PaginationItem>
                        <PaginationLink onClick={() => table.setPageIndex(0)}>
                            1
                        </PaginationLink>
                    </PaginationItem>
                )}
                {table.getState().pagination.pageIndex + 1 >= 5 && (
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}
                {/* 1 page before */}
                {table.getState().pagination.pageIndex + 1 - 1 > 0 && (
                    <PaginationItem>
                        <PaginationLink
                            onClick={() =>
                                table.setPageIndex(table.getState().pagination.pageIndex - 1)
                            }
                        >
                            {table.getState().pagination.pageIndex + 1 - 1}
                        </PaginationLink>
                    </PaginationItem>
                )}
                {/* Current page */}
                <PaginationItem>
                    <PaginationLink className="bg-accent">
                        {table.getState().pagination.pageIndex + 1}
                    </PaginationLink>
                </PaginationItem>
                {/* 1 page after */}
                {table.getState().pagination.pageIndex + 1 + 1 <=
                    table.getPageCount() && (
                        <PaginationItem>
                            <PaginationLink
                                onClick={() =>
                                    table.setPageIndex(table.getState().pagination.pageIndex + 1)
                                }
                            >
                                {table.getState().pagination.pageIndex + 1 + 1}
                            </PaginationLink>
                        </PaginationItem>
                    )}
                {table.getState().pagination.pageIndex + 1 + 2 <
                    table.getPageCount() - 1 && (
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                    )}
                {table.getState().pagination.pageIndex + 1 + 2 <
                    table.getPageCount() && (
                        <>
                            <PaginationItem>
                                <PaginationLink
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                >
                                    {table.getPageCount()}
                                </PaginationLink>
                            </PaginationItem>
                        </>
                    )}
                <PaginationItem>
                    <PaginationNext disabled={table.getState().pagination.pageIndex + 1 === table.getPageCount()} onClick={() => table.nextPage()} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}