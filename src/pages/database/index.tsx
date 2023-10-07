import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import DatabaseClient from "@/components/database/DatabaseClient";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { csvMaker } from "@/lib/csvMaker";

const DatabasePage: NextPage = () => {
    const { data, isLoading, isError } = api.potintialCustomers.getCustomers.useQuery();

    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Database</ConceptTitle>
                            <Typography>Explore the potintial customers from Facebook</Typography>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={"icon"}
                                    customeColor={"infoIcon"}
                                    onClick={() => data?.potintialCustomers && csvMaker(data?.potintialCustomers)}
                                >
                                    <FileDown />
                                </Button>
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