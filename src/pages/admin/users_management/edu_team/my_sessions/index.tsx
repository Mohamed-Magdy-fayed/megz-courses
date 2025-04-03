import { ConceptTitle } from "@/components/ui/Typoghraphy";
import type { NextPage } from "next";
import AppLayout from "@/components/pages/adminLayout/AppLayout";
import SessionsClient from "@/components/admin/operationsManagement/sessionsComponents/SessionClient";

const MyTasksPage: NextPage = () => {
    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>My Sessions</ConceptTitle>
                        </div>
                    </div>
                    <SessionsClient />
                </div>
            </main>
        </AppLayout>
    );
}

export default MyTasksPage