import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/Typoghraphy";
import CellAction from "./WhatsappTemplatesActionCell";
import { format } from "date-fns";
import { MessageTemplateButton, MessageTemplateDoc, MessageTemplateType } from "@prisma/client";
import { SeverityPill } from "@/components/ui/SeverityPill";
import { populateTemplate } from "@/lib/whatsApp";

export type MessageTemplateRow = {
  id: string,
  name: string,
  body: string,
  type: MessageTemplateType,
  button: MessageTemplateButton | null,
  document: MessageTemplateDoc | null,
  placeholders: string[],
  updatedAt: Date,
  createdAt: Date,
};

export const columns: ColumnDef<MessageTemplateRow>[] = [
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
    accessorKey: "name",
    cell: ({ row }) => (
      <Typography variant={"secondary"} className="text-sm font-normal">
        {row.original.name}
      </Typography>
    ),
  },
  {
    accessorKey: "body",
    cell: ({ row }) => {
      const holders: Record<string, string> = {}
      row.original.placeholders.map(h => {
        holders[h] = h
      })

      return (
        <div className="p-4 rounded-md bg-success text-success-foreground whitespace-pre-wrap">
          {populateTemplate(row.original, holders) || "Your message preview will appear here..."}
        </div>
      )
    }
  },
  {
    accessorKey: "placeholders",
    cell: ({ row }) => (
      <div className="flex items-center justify-start flex-wrap gap-2">
        {row.original.placeholders.map(holder => (
          <SeverityPill color="info" className="w-fit normal-case">{holder}</SeverityPill>
        ))}
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    filterFn: (row, columnId, filterValue) => {
      const val = row.original.createdAt
      const startDate = new Date(filterValue.split("|")[0])
      const endDate = new Date(filterValue.split("|")[1])
      return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
    },
    cell: ({ row }) => (
      <Typography>{format(row.original.createdAt, "dd/MMM/yyyy")}</Typography>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction
      id={row.original.id}
      body={row.original.body}
      name={row.original.name}
    />,
  },
];
