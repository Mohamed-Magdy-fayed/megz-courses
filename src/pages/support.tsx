import ContactSection from '@/components/landingPageComponents/ContactSection';
import LandingLayout from '@/components/landingPageComponents/LandingLayout';
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy';
import Head from 'next/head';

const SupportPage = () => {
    return (
        <LandingLayout>
            <Head>
                <title>Support | Megz Learning</title>
                <meta name="description" content="Support information for Megz Learning" />
                <meta name="robots" content="index, follow" />
            </Head>
            <div className='w-full'>
                <iframe
                    className='border-none w-full h-[85vh]'
                    allowFullScreen
                    src="https://docs.google.com/document/d/1h_03dwf4idv2hoc9ijwiXNdyz3iJ_Ovwe-TuLPM4g8E/preview"
                />
            </div>
            <ContactSection />
        </LandingLayout>
    );
};

export default SupportPage;
