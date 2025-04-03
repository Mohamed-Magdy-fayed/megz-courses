import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/Typoghraphy";
import { format } from "date-fns";
import Link from "next/link";

export type CertificateRow = {
    id: string;
    certificateId: string;
    completionDate: Date;
    courseName: string;
    levelName: string;
    createdAt: Date;
    updatedAt: Date;
}

export const columns: ColumnDef<CertificateRow>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "certificateId",
        header: "Certificates Number",
        cell: ({ row }) => (
            <Link className="in-table-link" href={`/certificates/${row.original.certificateId}`}>{row.original.certificateId}</Link>
        ),
    },
    {
        accessorKey: "courseName",
        header: "Course Name",
    },
    {
        accessorKey: "levelName",
        header: "Level Name",
    },
    {
        accessorKey: "completionDate",
        header: "Completion Date",
        cell: ({ row }) => <Typography>{format(row.original.completionDate, "PP")}</Typography>
    },
];
