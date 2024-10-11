import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import AppLayout from "@/components/layout/AppLayout";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import LeadsClient from "@/components/leads/LeadsClient";

const LeadsPage: NextPage = () => {
    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Leads</ConceptTitle>
                            <Typography>Explore the leads from your social media</Typography>
                        </div>
                    </div>
                    <PaperContainer>
                        <LeadsClient />
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    );
}

export default LeadsPage