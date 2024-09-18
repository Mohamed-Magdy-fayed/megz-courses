import LandingLayout from '@/components/landingPageComponents/LandingLayout';
import Head from 'next/head';

const TermsAndConditionsPage = () => {
    return (
        <LandingLayout>
            <Head>
                <title>Terms and Conditions | Megz Learning</title>
                <meta name="description" content="Terms and Conditions for Megz Learning" />
                <meta name="robots" content="index, follow" />
            </Head>
            <div className='w-full'>
                <iframe
                    className='border-none w-full h-[85vh]'
                    allowFullScreen
                    src="https://docs.google.com/document/d/1pVbvyEnM3_GtZpqJUlL4Nq7PprPXbeZOWagh20odE3k/preview"
                />
            </div>
        </LandingLayout>
    );
};

export default TermsAndConditionsPage;
