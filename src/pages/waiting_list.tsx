import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { PaperContainer } from "@/components/ui/PaperContainers";
import AppLayout from "@/components/layout/AppLayout";
import FullWaitingListClient from "@/components/fullWaitingList/FullWaitingListClient";
import { useEffect } from "react";

const WaitingListPage = () => {
    const { data: waitingList, refetch } = api.waitingList.getFullWaitingList.useQuery(undefined, { enabled: false });

    useEffect(() => {
        refetch()
    }, [])
    
    return (
        <AppLayout>
            <main>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Waiting List</ConceptTitle>
                        </div>
                    </div>
                    <PaperContainer>
                        <FullWaitingListClient formattedData={waitingList?.fullList.map(item => ({
                            id: item.user.id,
                            name: item.user.name,
                            image: item.user.image,
                            device: item.user.device,
                            email: item.user.email,
                            phone: item.user.phone,
                            orders: item.course.orders,
                            courseName: item.course.name,
                            courseSlug: item.course.slug,
                            courseId: item.course.id,
                            levelSlugs: item.course?.levels.map(lvl => ({ label: lvl.name, value: lvl.slug })) || [],
                            levelSlug: item.level?.slug || "",
                            levelName: item.level?.name || "",
                            createdAt: item.createdAt,
                            updatedAt: item.updatedAt,
                        })) || []} />
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    );
};

export default WaitingListPage;
