import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import { validCourseStatuses } from "@/lib/enumsTypes";
import { upperFirst } from "lodash";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import WaitingListClient from "@/components/traineeLists/waitingList/WaitingListClient";

export default function TraineeListPage() {
    // const [isResumeFormOpen, setIsResumeFormOpen] = useState(false);

    const { data } = api.traineeList.getListsCount.useQuery();

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
                                    {/* {status === "Postponded" && (
                                        <div className="flex flex-col gap-2">
                                            <Modal
                                                title="Resume studnets"
                                                description="move studnets to back to Waiting list"
                                                isOpen={isResumeFormOpen}
                                                onClose={() => setIsResumeFormOpen(false)}
                                                children={(
                                                    <ResumeStudentsForm setIsOpen={setIsResumeFormOpen} />
                                                )}
                                            />
                                            <Button onClick={() => {
                                                setIsResumeFormOpen(true)
                                            }}>
                                                <PlayCircle className="w-4 h-4 mr-2" />
                                                Resume students
                                            </Button>
                                        </div>
                                    )} */}
                                </div>
                                <WaitingListClient status={st} />
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </main>
        </AppLayout>
    );
};
