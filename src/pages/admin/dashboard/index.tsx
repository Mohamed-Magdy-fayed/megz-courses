import Dashboard from "@/components/admin/dashboard/overview/Dashboard";
import AppLayout from "@/components/pages/adminLayout/AppLayout";
import { useState } from "react";

export type DateRange = { from: Date; to: Date } | null

const getQuarterRange = (year: number, quarter: 1 | 2 | 3 | 4) => {
    const startMonth = (quarter - 1) * 3;
    const from = new Date(year, startMonth, 1);
    const to = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);
    return { from, to };
};

const getLastNQuarters = (n: number) => {
    const now = new Date();
    let year = now.getFullYear();
    let quarter = Math.floor(now.getMonth() / 3) + 1 as 1 | 2 | 3 | 4;
    const quarters: { year: number; quarter: 1 | 2 | 3 | 4 }[] = [];

    for (let i = 0; i < n; i++) {
        quarters.unshift({ year, quarter });
        quarter--;
        if (quarter < 1) {
            quarter = 4;
            year--;
        }
    }
    return quarters;
};

const Page = () => {
    const [dateRange, setDateRange] = useState<DateRange>(null);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1 as 1 | 2 | 3 | 4;

    // Last year's quarters
    const lastYear = currentYear - 1;
    const lastYearQuarters = [1, 2, 3, 4].map((q) => ({
        year: lastYear,
        quarter: q as 1 | 2 | 3 | 4,
    }));

    // Current year's quarters up to the current quarter
    const currentYearQuarters = Array.from({ length: currentQuarter }, (_, i) => ({
        year: currentYear,
        quarter: (i + 1) as 1 | 2 | 3 | 4,
    }));

    const allQuarters = [...lastYearQuarters, ...currentYearQuarters];

    const actionGroups = [
        {
            label: "Select Quarter",
            items: allQuarters.map(({ year, quarter }) => {
                const { from, to } = getQuarterRange(year, quarter);
                return {
                    label: `${year} Q${quarter}`,
                    icon: null,
                    onClick: () => setDateRange({ from, to }),
                };
            }).concat({
                label: `All time`,
                icon: null,
                onClick: () => setDateRange(null),
            }),
        },
    ];

    return (
        <AppLayout actionGroups={actionGroups}>
            <Dashboard dateRange={dateRange}></Dashboard>
        </AppLayout>
    );
};

export default Page;
