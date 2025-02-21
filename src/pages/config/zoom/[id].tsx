import AppLayout from '@/components/layout/AppLayout';
import GoBackButton from '@/components/ui/go-back';
import { PaperContainer } from '@/components/ui/PaperContainers';
import { Skeleton } from '@/components/ui/skeleton';
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy';
import ZoomAccountMeetings from '@/components/zoomAccount/zoomAccountMeetings/ZoomAccountMeetings';
import { api } from '@/lib/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

const ZoomClientPage = ({ id }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { data, isLoading } = api.zoomAccounts.getZoomAccount.useQuery({ id })

    return (
        <AppLayout>
            <GoBackButton />
            {data?.zoomClient?.name ? <ConceptTitle>{data?.zoomClient?.name}</ConceptTitle> : <Skeleton className='h-12 w-80' />}
            <Typography>Account Meetings</Typography>
            <PaperContainer>
                <ZoomAccountMeetings meetings={data?.sessions || []} isLoading={isLoading} />
            </PaperContainer>
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