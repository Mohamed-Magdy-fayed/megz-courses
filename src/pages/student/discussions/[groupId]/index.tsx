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

const StudentGroupDiscussionPage = ({ groupId }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { data: SessionData } = useSession()
    const { data, isLoading, isError, error } = api.discussions.getByGroupId.useQuery({ groupId })

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
                    sidebarLabel="Participants"
                    items={data.participants.map(participant => ({
                        icon: UserIcon,
                        title: participant.user.name,
                        action: participant.user.userRoles.some(role => role === "Teacher")
                            ? (
                                <WrapWithTooltip text="Private Discussion">
                                    <Button asChild className="ml-auto h-4" customeColor="primaryIcon" variant="default" size="sm">
                                        <Link href={`/student/discussions/${groupId}/${SessionData?.user.id}`}>
                                            <MessagesSquareIcon size={12} />
                                        </Link>
                                    </Button>
                                </WrapWithTooltip>
                            )
                            : null,
                    }))}
                />
            )}
        >
            <DiscussionView groupId={groupId} />
        </LearningLayout>
    );
};

export const getServerSideProps: GetServerSideProps<{ groupId: string }> = async (ctx) => {
    console.log(ctx.query);
    
    if (typeof ctx.query.groupId !== "string") return { notFound: true };
    return {
        props: {
            groupId: ctx.query.groupId,
        },
    };
};

export default StudentGroupDiscussionPage;
