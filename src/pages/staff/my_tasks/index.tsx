import { ConceptTitle } from "@/components/ui/Typoghraphy";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import TesterPlacmentTestClient from "@/components/contentComponents/testerPlacmentTests/TesterPlacmentTestsClient";
import AppLayout from "@/components/layout/AppLayout";

const MyTasksPage: NextPage = () => {
    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>My Tasks</ConceptTitle>
                        </div>
                    </div>
                    <PaperContainer>
                        <TesterPlacmentTestClient />
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    );
}

export default MyTasksPage