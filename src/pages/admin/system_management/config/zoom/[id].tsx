import ZoomAccountMeetings from '@/components/admin/systemManagement/config/zoomAccount/zoomAccountMeetings/ZoomAccountMeetings';
import AppLayout from '@/components/pages/adminLayout/AppLayout';
import GoBackButton from '@/components/ui/go-back';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy';
import { api } from '@/lib/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

const ZoomClientPage = ({ id }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { data } = api.zoomAccounts.getZoomAccount.useQuery({ id })

    return (
        <AppLayout>
            <GoBackButton />
            {data?.zoomClient?.name ? <ConceptTitle>{data?.zoomClient?.name}</ConceptTitle> : <Skeleton className='h-12 w-80' />}
            <Typography>Account Meetings</Typography>
            <Tabs defaultValue="upcoming" id="clientMeetings">
                <TabsList className="w-full">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <ZoomAccountMeetings clientId={id} />
                </TabsContent>
                <TabsContent value="upcoming">
                    <ZoomAccountMeetings clientId={id} isUpcoming />
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}

export const getServerSideProps: GetServerSideProps<{ id: string }> = async (ctx) => {


    return {
        props: {
            id: ctx.query.id as string,
        }
    }
}

export default ZoomClientPage