import AppLayout from "@/components/pages/adminLayout/AppLayout";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import DiscussionView from "@/components/general/discussions/DiscussionView";

const DiscussionPage = ({ groupId, studentId }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   
    return (
        <AppLayout>
            <DiscussionView groupId={groupId} studentId={studentId} />
        </AppLayout>
    );
};

export const getServerSideProps: GetServerSideProps<{ groupId: string, studentId: string }> = async (ctx) => {
    if (typeof ctx.query.groupId !== "string") return { notFound: true };
    if (typeof ctx.query.studentId !== "string") return { notFound: true };
    return {
        props: {
            groupId: ctx.query.groupId,
            studentId: ctx.query.studentId,
        },
    };
};

export default DiscussionPage;
