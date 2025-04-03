import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import LandingLayout from "@/components/pages/landingPageComponents/LandingLayout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LoginModal from "@/components/general/modals/LoginModal";
import GoBackButton from "@/components/ui/go-back";
import MyCoursesClient from "@/components/student/myCoursesComponents/MyCoursesClient";

const CoursesPage: NextPage = () => {
    const session = useSession()

    const [loginModalOpen, setLoginModalOpen] = useState(false)

    useEffect(() => {
        if (session.status === "loading") return
        if (session.data?.user) setLoginModalOpen(false)
        if (!session.data?.user) setLoginModalOpen(true)
    }, [session.data?.user])

    return (
        <LandingLayout>
            <LoginModal open={loginModalOpen} setOpen={setLoginModalOpen} />
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex gap-2 items-center">
                            <GoBackButton />
                            <ConceptTitle>Courses</ConceptTitle>
                        </div>
                    </div>
                    {
                        !session.data?.user
                            ? (<Typography>Please login to continue!</Typography>)
                            : !session.data?.user.emailVerified ?
                                (<Typography>Please verify your email!</Typography>)
                                : (
                                    <PaperContainer>
                                        <MyCoursesClient />
                                    </PaperContainer>
                                )
                    }
                </div>
            </main>
        </LandingLayout>
    );
}

export default CoursesPage