import LandingLayout from '@/components/pages/landingPageComponents/LandingLayout';
import Head from 'next/head';

const DocumentationPage = () => {
    return (
        <LandingLayout>
            <Head>
                <title>Documentation | Gateling TMS</title>
                <meta name="description" content="Documentation for Gateling TMS" />
                <meta name="robots" content="index, follow" />
            </Head>
            <div className='w-full'>
                <iframe
                    src="https://scribehow.com/embed/Create_a_quick_new_student_order__mn0oWxcuSKKVY3yPefD1tg"
                    width="100%"
                    height={800}
                    allow="fullscreen"
                    style={{ aspectRatio: "1 / 1", border: 0, minHeight: 480 }}
                />
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
