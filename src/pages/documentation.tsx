import LandingLayout from '@/components/landingPageComponents/LandingLayout';
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy';
import Head from 'next/head';

const DocumentationPage = () => {
    return (
        <LandingLayout>
            <Head>
                <title>Documentation | Megz Learning</title>
                <meta name="description" content="Documentation for Megz Learning" />
                <meta name="robots" content="index, follow" />
            </Head>
            <div className="p-12 space-y-8">
                <ConceptTitle className="text-2xl font-semibold mb-4">Documentation</ConceptTitle>

                <div>
                    <Typography variant={"secondary"}>Overview</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>This app is designed to help small teaching organizations grow more easily by providing them with tools to systemize and automate their operations. It offers a comprehensive system to manage daily tasks, allowing organizations to focus more on teaching and less on administrative work.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>Installation Guide</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography variant={"secondary"}>1. Update the Site Identity</Typography>
                        <Typography>Instructions on how to personalize your organization's branding within the app.</Typography>

                        <Typography variant={"secondary"}>2. Create Your Team Accounts</Typography>
                        <Typography>Guide on setting up accounts for various team members, including sales, chat, teachers, and admins.</Typography>

                        <Typography variant={"secondary"}>3. Create Your Courses and Upload the Materials</Typography>
                        <Typography>Instructions on creating courses and uploading materials.</Typography>

                        <Typography variant={"secondary"}>4. Operate Day-to-Day Tasks</Typography>
                        <Typography>How to use the system tools to manage orders and move students through the operational cycle of your organization.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>Troubleshooting</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>For common issues, please report them to info@megz.pro</Typography>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
};

export default DocumentationPage;
