import LandingLayout from '@/components/landingPageComponents/LandingLayout';
import { PaperContainer } from '@/components/ui/PaperContainers';
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy';
import { env } from '@/env.mjs';
import { format } from 'date-fns';
import Head from 'next/head';

const TermsAndConditionsPage = () => {
    return (
        <LandingLayout>
            <Head>
                <title>Terms and Conditions | Megz Learning</title>
                <meta name="description" content="Terms and Conditions for Megz Learning" />
                <meta name="robots" content="index, follow" />
            </Head>
            <div className="p-12 space-y-8">
                <ConceptTitle className="text-2xl font-semibold mb-4">Terms and Conditions</ConceptTitle>

                <Typography><strong>Effective Date:</strong> {format(new Date("7/aug/2024"), "PPP")}</Typography>

                <div>
                    <Typography variant={"secondary"}>1. Introduction</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>Welcome to Megz Learning! These Terms and Conditions outline the rules and regulations for the use of our learning management system. By accessing or using our platform, you agree to comply with these Terms and Conditions.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>2. User Accounts</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>Users are required to create an account to access specific pages of the platform. There are several types of accounts: Admin, Student (automatically created upon signup), Teacher, and Agent (created by the Admin as needed). All users must provide accurate information during account creation.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>3. Content and Usage</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>All course content on the platform is owned by the site owner and may be created by the owner, Admin, or Agents. Content must be appropriate and, if necessary, include age limits in the course name. Sharing of content outside the platform is strictly prohibited.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>4. Payment and Refund Policy</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>Courses on the platform are paid. Refunds are handled according to the system owner's refund policy, which can be provided upon request by contacting the owner.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>5. User Conduct</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>Users are expected to adhere to standard behavior, including respect for others and adherence to the platform's rules. Non-adherence to these Terms and Conditions may result in suspension of the user's account.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>6. Data Collection and Privacy</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>We collect data including name, email, phone number, and optionally, an image and address. We also collect data on courses purchased, session times, and grades. This data is used for analytics and personalized offers and is stored in our cloud database. We do not share this data with third parties.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>7. Intellectual Property</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>We do not hold any trademarks, copyrights, or patents related to our platform. Intellectual property rights for user-generated content are not managed by the platform.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>8. Changes to Terms and Conditions</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>The platform owner reserves the right to modify these Terms and Conditions as needed. Users will be notified of any changes via email.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>9. Governing Law</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>These Terms and Conditions are governed by the laws of Egypt.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"secondary"}>10. Contact Us</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>If you have any questions or concerns about these Terms and Conditions, please contact us at:</Typography>
                        <div className='grid'>
                            <Typography><strong>Megz Learning</strong></Typography>
                            <Typography>Email: <a href={`mailto:${env.NEXT_PUBLIC_GMAIL_EMAIL}`} className="text-info underline">{env.NEXT_PUBLIC_GMAIL_EMAIL}</a></Typography>
                        </div>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
};

export default TermsAndConditionsPage;
