import { ConceptTitle } from "@/components/ui/Typoghraphy";
import type { NextPage } from "next";
import AppLayout from "@/components/pages/adminLayout/AppLayout";
import ZoomSessionsClient from "@/components/admin/operationsManagement/zoomSessions/ZoomSessionsClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

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
                    <Tabs defaultValue="upcoming" id="sessions">
                        <TabsList className="w-full">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all">
                            <ZoomSessionsClient />
                        </TabsContent>
                        <TabsContent value="upcoming">
                            <ZoomSessionsClient isUpcoming />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </AppLayout>
    );
}

export default SessionsPage