import AppLayout from '@/components/layout/AppLayout';
import GoBackButton from '@/components/ui/go-back';
import { PaperContainer } from '@/components/ui/PaperContainers';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy';
import ZoomAccountMeetings from '@/components/zoomAccount/zoomAccountMeetings/ZoomAccountMeetings';
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
                    <PaperContainer>
                        <ZoomAccountMeetings clientId={id} />
                    </PaperContainer>
                </TabsContent>
                <TabsContent value="upcoming">
                    <PaperContainer>
                        <ZoomAccountMeetings clientId={id} isUpcoming />
                    </PaperContainer>
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