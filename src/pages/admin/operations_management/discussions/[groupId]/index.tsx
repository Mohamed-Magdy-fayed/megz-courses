import AppLayout from "@/components/pages/adminLayout/AppLayout";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import DiscussionView from "@/components/general/discussions/DiscussionView";

const GroupDiscussionPage = ({ groupId }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <AppLayout>
            <DiscussionView groupId={groupId} />
        </AppLayout>
    );
};

export const getServerSideProps: GetServerSideProps<{ groupId: string }> = async (ctx) => {
    if (typeof ctx.query.groupId !== "string") return { notFound: true };
    return {
        props: {
            groupId: ctx.query.groupId,
        },
    };
};

export default GroupDiscussionPage;
