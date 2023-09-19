import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { TransparentButton } from "@/components/ui/Buttons";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import AppLayout from "@/layouts/AppLayout";
import { api } from "@/lib/api";
import { SvgIcon, Typography } from "@mui/material";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import DatabaseClient from "@/components/database/DatabaseClient";
import { useExport } from "@/zustand/exportTrigger";

const DatabasePage: NextPage = () => {
    const { data, isLoading, isError } = api.potintialCustomers.getCustomers.useQuery();
    const { exportTrigger } = useExport()

    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Database</ConceptTitle>
                            <Typography>Explore the potintial customers from Facebook</Typography>
                            <div className="flex items-center gap-2">
                                <TransparentButton onClick={() => exportTrigger()}>
                                    <SvgIcon fontSize="small">
                                        <FileDownloadOutlinedIcon />
                                    </SvgIcon>
                                    Export
                                </TransparentButton>
                            </div>
                        </div>
                    </div>
                    <PaperContainer>
                        {isLoading ? (
                            <Spinner></Spinner>
                        ) : isError ? (
                            <>Error</>
                        ) : (
                            <DatabaseClient data={data.potintialCustomers}></DatabaseClient>
                        )}
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    );
}

export default DatabasePage