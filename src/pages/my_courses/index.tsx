import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import LandingLayout from "@/components/landingPageComponents/LandingLayout";
import { useSession } from "next-auth/react";
import CoursesClient from "@/components/courses/CoursesClient";
import { useEffect, useState } from "react";
import LoginModal from "@/components/modals/LoginModal";

const CoursesPage: NextPage = () => {
    const session = useSession()

    const [loginModalOpen, setLoginModalOpen] = useState(false)

    useEffect(() => {
        if (!session.data?.user) setLoginModalOpen(true)
        if (session.data?.user) setLoginModalOpen(false)
    }, [session.data?.user])

    return (
        <LandingLayout>
            <LoginModal open={loginModalOpen} setOpen={setLoginModalOpen} />
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Courses</ConceptTitle>
                        </div>
                    </div>
                    <PaperContainer>
                        {
                            !session.data?.user
                                ? (<Typography>Please login to continue!</Typography>)
                                : (
                                    <CoursesClient userId={session.data?.user.id} />
                                )
                        }
                    </PaperContainer>
                </div>
            </main>
        </LandingLayout>
    );
}

export default CoursesPage