import { DataTable } from '@/components/ui/DataTable'
import { Typography } from '@/components/ui/Typoghraphy'
import WrapWithTooltip from '@/components/ui/wrap-with-tooltip'
import { api } from '@/lib/api'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function GroupStudentsTable({ studentIds }: { studentIds: string[] }) {
    const { data, isLoading } = api.users.getStudents.useQuery({ ids: studentIds })
    return (
        <DataTable
            columns={[
                {
                    accessorKey: "name", header: "Student", cell: ({ row }) => (
                        <div className="flex items-center justify-between w-full gap-4">
                            <Typography className="mr-auto">{row.original.name}</Typography>
                            <WrapWithTooltip text="Go to account">
                                <Link
                                    href={`/admin/users_management/account/${row.original.id}`}
                                    target="_blank"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                    }}
                                >
                                    <ExternalLink className="w-4 h-4 text-info"></ExternalLink>
                                </Link>
                            </WrapWithTooltip>
                        </div>
                    )
                },
            ]}
            data={data?.users || []}
            setData={() => { }}
            isSuperSimple
            isLoading={isLoading}
        />
    )
}
