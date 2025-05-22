import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import DiscussionView from "@/components/general/discussions/DiscussionView";
import LearningLayout from "@/components/pages/LearningLayout/LearningLayout";
import { DisplayError } from "@/components/ui/display-error";
import { NavMain } from "@/components/pages/LearningLayout/nav-main";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { MessagesSquareIcon, UserIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";

const StudentPrivateDiscussionPage = ({ groupId, studentId }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { data: SessionData } = useSession()
    const { data, isLoading, isError, error } = api.discussions.getByGroupAndStudent.useQuery({ groupId, studentId })

    return (
        <LearningLayout
            sidebarContent={isLoading && !error ? (
                <Skeleton className="w-full h-full" />
            ) : isError && error ? (
                <DisplayError message={error.message} />
            ) : !data.participants ? (
                <DisplayError message={`No data.participants!`} />
            ) : (
                <NavMain
                    items={data.participants.map(participant => ({
                        icon: UserIcon,
                        title: participant.user.name,
                        action: participant.user.userRoles.some(role => role === "Teacher")
                            ? (
                                <WrapWithTooltip text="Private Discussion">
                                    <Button asChild className="ml-auto" customeColor="primaryIcon" variant="icon">
                                        <Link href={`/student/discussions/${groupId}/${SessionData?.user.id}`}>
                                            <MessagesSquareIcon size={20} />
                                        </Link>
                                    </Button>
                                </WrapWithTooltip>
                            )
                            : null,
                    }))}
                />
            )}
        >
            <DiscussionView groupId={groupId} studentId={studentId} />
        </LearningLayout>
    );
};

export const getServerSideProps: GetServerSideProps<{ groupId: string; studentId: string }> = async (ctx) => {
    if (typeof ctx.query.groupId !== "string") return { notFound: true };
    if (typeof ctx.query.studentId !== "string") return { notFound: true };
    return {
        props: {
            groupId: ctx.query.groupId,
            studentId: ctx.query.studentId,
        },
    };
};

export default StudentPrivateDiscussionPage;
