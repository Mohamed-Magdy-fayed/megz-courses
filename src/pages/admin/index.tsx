import AppLayout from '@/components/pages/adminLayout/AppLayout';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';

const AdminPage = () => {
    const { data } = useSession()

    return (
        <AppLayout>
            Welcome: {data?.user.name}
        </AppLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {


    return {
        props: {

        }
    }
}

export default AdminPage