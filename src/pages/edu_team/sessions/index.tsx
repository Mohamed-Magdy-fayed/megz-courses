import { ConceptTitle } from "@/components/ui/Typoghraphy";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import AppLayout from "@/components/layout/AppLayout";
import SessionsClient from "@/components/sessionsComponents/SessionClient";

const SessionsPage: NextPage = () => {
    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Sessions</ConceptTitle>
                        </div>
                    </div>
                    <PaperContainer>
                        <SessionsClient isAdmin />
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    );
}

export default SessionsPage