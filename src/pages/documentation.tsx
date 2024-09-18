import LandingLayout from '@/components/landingPageComponents/LandingLayout';
import Head from 'next/head';

const DocumentationPage = () => {
    return (
        <LandingLayout>
            <Head>
                <title>Documentation | Megz Learning</title>
                <meta name="description" content="Documentation for Megz Learning" />
                <meta name="robots" content="index, follow" />
            </Head>
            <div className='w-full'>
                <iframe
                    className='border-none w-full h-[85vh]'
                    allowFullScreen
                    src="https://docs.google.com/document/d/111Vllf-qK-jHw6Supfx4aGVS2X_gkfxWEiFx4trm54o/preview"
                />
            </div>
        </LandingLayout>
    );
};

export default DocumentationPage;
