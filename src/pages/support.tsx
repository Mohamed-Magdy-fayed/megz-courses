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
            <div className="p-12 space-y-8">
                <ConceptTitle className="text-2xl font-semibold mb-4">Support</ConceptTitle>

                <div>
                    <Typography variant={"secondary"}>Support Contact</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>If you need support, please contact out team at:</Typography>
                        <Typography>Email: info@megz.pro</Typography>
                        <Typography>Phone: +201123862218 (WhatsApp available)</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>FAQs</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>Here are some common questions and answers:</Typography>

                        <Typography variant={"secondary"}>1. How do I reset my password?</Typography>
                        <Typography>You can reset your password by clicking the "Forgot Password" link on the login page and following the instructions.</Typography>

                        <Typography variant={"secondary"}>2. How do I add new courses?</Typography>
                        <Typography>To add new courses, navigate to the "Courses" section in your dashboard and follow the prompts to create and upload course materials.</Typography>

                        <Typography variant={"secondary"}>3. How do I manage team roles?</Typography>
                        <Typography>Team roles can be managed under the "Team Management" section in your admin dashboard. Here, you can assign roles and permissions to each team member.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>Help Resources</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>You can find additional tutorials and guides on our <a href="#" className="text-blue-500 underline">YouTube channel</a>.</Typography>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
};

export default SupportPage;
