import { ColumnDef, ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";

export type StringKeyOf<TData> = Extract<keyof TData, string>;
export type ValueKeyOf<TData, TValue> = Extract<{ [K in keyof TData]: TData[K] extends TValue ? K : never }[StringKeyOf<TData>], string>;
export type StringValueOf<TData> = Extract<TData[StringKeyOf<TData>], string>;

export type SumColumn<TData> = {
    key: ValueKeyOf<TData, number>,
    label: string,
    isNegative?: boolean,
};
export type DateRangeColumn<TData> = {
    key: ValueKeyOf<TData, Date>,
    label: string,
};
export type SearchColumn<TData> = {
    key: ValueKeyOf<TData, string>,
    label: string,
};
export type FilterOption<TData> = {
    label: string;
    value: StringValueOf<TData>;
};
export type FilterColumn<TData> = {
    key: StringKeyOf<TData>;
    filterName: string;
    values: {
        label: string;
        value: StringValueOf<TData>;
        count?: number;
    }[];
};

export type ServerDataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    selectedData: TData[];
    totalCount: number;
    filteredCount: number;
    setData: React.Dispatch<React.SetStateAction<TData[]>>;
    onDelete?: (callback?: () => void) => void;
    handleImport?: (data: TData[]) => void;
    handleExport?: (keys: Extract<keyof TData, string>[]) => void;
    importConfig?: {
        templateName: string;
        sheetName: string;
        reqiredFields: Extract<keyof TData, string>[]
        extraDetails?: React.ReactNode;
    },
    exportConfig?: {
        fileName: string;
        sheetName: string;
        fields?: Extract<keyof TData, string>[];
    },
    isLoading?: boolean,
    error?: string,
    sums?: SumColumn<TData>[],
    dateRanges?: DateRangeColumn<TData>[],
    searches?: SearchColumn<TData>[],
    filters?: FilterColumn<TData>[],
    isSuperSimple?: boolean;
    resetSelection?: boolean;
    columnFilters: ColumnFiltersState;
    setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
    pagination: PaginationState;
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
    sorting: SortingState;
    setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
}