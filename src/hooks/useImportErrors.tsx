import { DataTable } from "@/components/ui/DataTable";
import Modal from "@/components/ui/modal"
import { Typography } from "@/components/ui/Typoghraphy";
import { upperFirst } from "lodash";
import { useState } from "react"

function useImportErrors<TData>() {
    const [error, setError] = useState<{
        isError: boolean;
        lines: {
            lineNumber: number;
            lineData: TData;
            lineError: string;
        }[];
    }>({ isError: false, lines: [] })

    const ErrorsModal = (
        <Modal
            title="Errors"
            description="Please only import these lines again!"
            isOpen={error.isError}
            onClose={() => setError({ isError: false, lines: [] })}
            children={(
                <div>
                    {error.isError && error.lines[0]?.lineData && (
                        <DataTable
                            columns={[
                                { accessorKey: "lineNumber", header: "Line" },
                                { accessorKey: "lineError", header: "Error", cell: ({ row }) => <Typography className="text-destructive">{row.original.lineError}</Typography> },
                                ...Object.keys(error.lines[0]?.lineData).map(k => ({
                                    accessorKey: k,
                                    header: upperFirst(k),
                                }))
                            ]}
                            isSuperSimple
                            data={error.lines.map(line => ({
                                lineNumber: line.lineNumber,
                                lineError: line.lineError,
                                error: "Email",
                                ...line.lineData,
                            }))}
                            setData={() => { }}
                        />
                    )}
                </div>
            )}
        />
    )

    return {
        error,
        setError,
        ErrorsModal,
    }
}

export default useImportErrors