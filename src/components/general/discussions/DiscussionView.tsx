import { api } from "@/lib/api";
import { useMemo } from "react";
import UserAvatar from "@/components/ui/user/UserAvatar";
import Link from "next/link";
import ParticipantsSheet from "@/components/general/discussions/ParticipantsSheet";
import DiscussionMessages from "@/components/general/discussions/DiscussionMessages";
import DiscussionMessageForm from "@/components/general/discussions/DiscussionMessageForm";
import { useSession } from "next-auth/react";

export default function DiscussionView({ groupId, studentId }: { groupId: string, studentId?: string }) {
    const { data } = studentId
        ? api.discussions.getByGroupAndStudent.useQuery({ groupId, studentId })
        : api.discussions.getByGroupId.useQuery({ groupId });

    const student = useMemo(() => data?.participants[0], [data?.participants]);

    const { data: sessionData } = useSession();

    return (
        <div className="flex flex-col h-[85dvh] max-h-[85dvh] bg-background">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-card sticky top-0">
                {studentId ? (
                    <>
                        <UserAvatar src={student?.user.image || ""} />
                        <div>
                            {sessionData?.user.userRoles.includes("Student") ? (
                                <span className="font-semibold text-base">{student?.user.name || "Private Chat"}</span>
                            ) : (
                                <Link
                                    href={`/admin/users_management/account/${studentId}`}
                                    className="font-semibold text-base in-table-link"
                                >
                                    {student?.user.name || "Private Chat"}
                                </Link>
                            )}
                            <div className="text-xs text-muted">{student?.user.email}</div>
                        </div>
                    </>
                ) : (
                    <div className="font-semibold text-base">Group Discussion</div>
                )}
                {data?.participants && <ParticipantsSheet participants={data.participants} />}
            </div>
            {/* Chat body */}
            <DiscussionMessages discussionId={data?.id} />
            {/* Input */}
            <DiscussionMessageForm discussionId={data?.id} />
        </div>
    )
}
