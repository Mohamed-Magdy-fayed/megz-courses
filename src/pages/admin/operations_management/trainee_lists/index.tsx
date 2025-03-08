import { ConceptTitle } from "@/components/ui/Typoghraphy";
import AppLayout from "@/components/layout/AppLayout";
import { validCourseStatuses } from "@/lib/enumsTypes";
import { upperFirst } from "lodash";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import TraineeListClient from "@/components/admin/operationsManagement/traineeLists/TraineeListClient";

export default function TraineeListPage() {
    return (
        <AppLayout>
            <main>
                <div className="flex flex-col gap-2">
                    <Tabs defaultValue="Waiting" id="trainee_list">
                        <TabsList className="flex">
                            {validCourseStatuses.map(st => (
                                <TabsTrigger key={st} value={st}>{upperFirst(st)}</TabsTrigger>
                            ))}
                        </TabsList>
                        {validCourseStatuses.map(st => (
                            <TabsContent key={st} value={st} className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex flex-col gap-2">
                                        <ConceptTitle>{upperFirst(st)} List</ConceptTitle>
                                    </div>
                                </div>
                                <TraineeListClient status={st} />
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </main>
        </AppLayout>
    );
};
