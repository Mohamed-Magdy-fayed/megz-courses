import { ConceptTitle } from "@/components/ui/Typoghraphy";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import LandingLayout from "@/components/landingPageComponents/LandingLayout";
import { useSession } from "next-auth/react";
import CoursesClient from "@/components/courses/CoursesClient";

const CoursesPage: NextPage = () => {
    const session = useSession()

    return (
        <LandingLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Courses</ConceptTitle>
                        </div>
                    </div>
                    <PaperContainer>
                        <CoursesClient userId={session.data?.user.id!} />
                    </PaperContainer>
                </div>
            </main>
        </LandingLayout>
    );
}

export default CoursesPage