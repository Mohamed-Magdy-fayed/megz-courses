import LandingLayout from '@/components/landingPageComponents/LandingLayout';
import Head from 'next/head';

const PrivacyPolicyPage = () => {
    return (
        <LandingLayout>
            <Head>
                <title>Privacy Policy | Megz Courses</title>
                <meta name="description" content="Privacy Policy for Megz Courses" />
                <meta name="robots" content="index, follow" />
            </Head>
            <div className='w-full'>
                <iframe
                    className='border-none w-full h-[85vh]'
                    allowFullScreen
                    src="https://docs.google.com/document/d/1XKdMsc_CI9X9zhSAG-bgNUAYn0g4puq-Re9gE_SEg28/preview"
                />
            </div>
        </LandingLayout>
    );
};

export default PrivacyPolicyPage;
