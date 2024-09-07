import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import AppLayout from "@/components/layout/AppLayout";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import DatabaseClient from "@/components/database/DatabaseClient";

const DatabasePage: NextPage = () => {
    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Database</ConceptTitle>
                            <Typography>Explore the potintial customers from Facebook</Typography>
                        </div>
                    </div>
                    <PaperContainer>
                        <DatabaseClient />
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    );
}

export default DatabasePage