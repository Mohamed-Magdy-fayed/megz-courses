import { $Enums, Prisma, PrismaClient } from "@prisma/client";
import { SortingState } from "@tanstack/react-table";
import { z } from "zod";

export const createSchema = <TData extends Record<string, any>>() => {
    // Date ranges schema
    const dateRangesSchema = z.object({
        key: z.string() as unknown as z.ZodType<
            Extract<{ [K in keyof TData]: TData[K] extends Date ? K : never }[keyof TData], string>
        >,
        from: z.date(),
        to: z.date(),
    });

    // Searches schema
    const searchesSchema = z.object({
        key: z.string() as unknown as z.ZodType<
            Extract<{ [K in keyof TData]: TData[K] extends string ? K : never }[keyof TData], string>
        >,
        value: z.string(),
    });

    // Sum schema
    const sumsSchema = z.object({
        key: z.string() as unknown as z.ZodType<
            Extract<{ [K in keyof TData]: TData[K] extends number ? K : never }[keyof TData], string>
        >,
        label: z.string(),
        isNegative: z.boolean().optional(),
    }).optional();

    // Filters schema
    const filtersSchema = z.object({
        key: z.string() as unknown as z.ZodType<Extract<keyof TData, string>>,
        value: z.string() as unknown as z.ZodType<Extract<TData[keyof TData], string>>,
    });

    const sortingSchema = z.object({
        key: z.string() as unknown as z.ZodType<Extract<keyof TData, string>>,
        value: z.enum(["desc", "asc", "none"])
    })

    return z.object({
        sums: z.array(sumsSchema).optional(),
        dateRanges: z.array(dateRangesSchema).optional(),
        searches: z.array(searchesSchema).optional(),
        filters: z.array(filtersSchema).optional(),
        sortings: z.array(sortingSchema).optional(),
    });
};

// Define a generic filter schema that allows dynamic keys but enforces types
export const createGenericSchema = <TData extends Record<string, any>>() =>
    z.object({
        pageSize: z.number(),
        pageIndex: z.number(),
        dateRanges: z.array(
            z.object({ key: z.any() as z.ZodType<Extract<{ [K in keyof TData]: TData[K] extends Date ? K : never }[keyof TData], string>>, from: z.date(), to: z.date() })
        ).optional(),
        searches: z.array(
            z.object({ key: z.any() as z.ZodType<Extract<keyof TData, string>>, value: z.string() })
        ).optional(),
        filters: z.array(
            z.object({ key: z.any() as z.ZodType<Extract<keyof TData, string>>, value: z.any() as z.ZodType<Extract<TData[keyof TData], string>> })
        ).optional(),
        sorting: z.array(
            z.object({
                id: z.any() as z.ZodType<Extract<keyof TData, string>>,
                desc: z.boolean(),
            })
        ).optional().default([]),
    });

// Define a generic export schema that allows dynamic keys but enforces types
export const createGenericExportSchema = <TData>() =>
    z.object({
        dateRanges: z.array(
            z.object({ key: z.any() as z.ZodType<Extract<{ [K in keyof TData]: TData[K] extends Date ? K : never }[keyof TData], string>>, from: z.date(), to: z.date() })
        ).optional(),
        searches: z.array(
            z.object({ key: z.any() as z.ZodType<Extract<keyof TData, string>>, value: z.string() })
        ).optional(),
        filters: z.array(
            z.object({ key: z.any() as z.ZodType<Extract<keyof TData, string>>, value: z.any() as z.ZodType<Extract<TData[keyof TData], string>> })
        ).optional(),
        select: z.array(z.any() as z.ZodType<Extract<keyof TData, string>>),
        sorting: z.array(
            z.object({
                id: z.any() as z.ZodType<Extract<keyof TData, string>>,
                desc: z.boolean(),
            })
        ).optional().default([]),
    });

export type GenericSchema<TData extends Record<string, any>> = z.infer<ReturnType<typeof createGenericSchema<TData>>>;

// Helper function to generate date range conditions
export const getDateRangeConditions = <TData extends Record<string, any>>(
    dateRanges?: GenericSchema<TData>["dateRanges"]
) => {
    if (!dateRanges) return {};
    return Object.fromEntries(
        dateRanges.map(dr => [dr.key, { gte: dr.from, lte: dr.to }])
    );
};

// Helper function to generate search conditions
export const getSearchConditions = <TData extends Record<string, any>>(
    searches?: GenericSchema<TData>["searches"]
) => {
    if (!searches) return {};
    return Object.fromEntries(
        searches.map(s => [s.key, { contains: s.value, mode: "insensitive" }])
    );
};

// Helper function to generate filter conditions
export const getFilterConditions = <TData extends Record<string, any>>(
    filters?: GenericSchema<TData>["filters"]
) => {
    if (!filters) return {};
    return Object.fromEntries(filters.map(f => [f.key, f.value]));
};

// Function to dynamically count filtered data
export const getDynamicCounts = async <TData extends Record<string, any>>(
    prismaModel: any, // Replace with actual Prisma model type if possible
    whereConditions: Record<string, any>,
    countFields: (keyof TData)[]
) => {
    // Generate Prisma count queries dynamically
    const countQueries = countFields.map(field =>
        prismaModel.count({ where: { ...whereConditions, [field]: { not: null } } })
    );

    const [totalCount, filteredCount, ...fieldCounts] = await prismaModel.$transaction([
        prismaModel.count(), // Total count
        prismaModel.count({ where: whereConditions }), // Filtered count
        ...countQueries, // Field-specific counts
    ]);

    return {
        totalCount,
        filteredCount,
        fieldCounts: Object.fromEntries(countFields.map((field, i) => [field, fieldCounts[i]])),
    };
};

// Usage within createWhereConditions
export const createWhereConditions = <TData extends Record<string, any>>(
    filters: Pick<GenericSchema<TData>, "dateRanges" | "filters" | "searches">
) => ({
    ...getDateRangeConditions(filters.dateRanges),
    ...getSearchConditions(filters.searches),
    ...getFilterConditions(filters.filters),
});

export const transformSortingForPrisma = (sorting: SortingState) => {
    return sorting.map(({ id, desc }) => ({
        [id]: desc ? "desc" : "asc",
    }));
};
