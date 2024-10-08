import LandingLayout from '@/components/landingPageComponents/LandingLayout';
import { ToggleSection } from '@/components/ui/ToggleSection';
import { Typography, ConceptTitle } from '@/components/ui/Typoghraphy';
import Head from 'next/head';
import Link from 'next/link';

const TermsAndConditionsPage = () => {
    return (
        <LandingLayout>
            <Head>
                <title>Terms and Conditions | Megz Learning</title>
                <meta name="description" content="Terms and Conditions for Megz Learning" />
                <meta name="robots" content="index, follow" />
            </Head>
            <div className="max-w-6xl mx-auto p-6">
                <Typography className="text-primary mb-3" variant={"secondary"}>Megz Learning</Typography>
                <ConceptTitle className="mb-2 !text-6xl">Terms and Conditions</ConceptTitle>
                <Typography className='block mb-12 text-muted'>19<sup>th</sup> September 2024</Typography>

                <div className="space-y-4">
                    <ToggleSection title="Overview" defaultIsOpen>
                        <Typography>
                            Welcome to Megz Learning! These Terms and Conditions outline the rules and regulations for the use of our learning management system. By accessing or using our platform, you agree to comply with these Terms and Conditions.
                        </Typography>
                    </ToggleSection>

                    <ToggleSection title="User Accounts">
                        <Typography>
                            Users are required to create an account to access specific pages of the platform. There are several types of accounts: Admin, Student (automatically created upon signup), Teacher, and Agent (created by the Admin as needed). All users must provide accurate information during account creation.
                        </Typography>
                    </ToggleSection>

                    <ToggleSection title="Content and Usage">
                        <Typography>
                            All course content on the platform is owned by the site owner and may be created by the owner, Admin, or Agents. Content must be appropriate and, if necessary, include age limits in the course name. Sharing of content outside the platform is strictly prohibited.
                        </Typography>
                    </ToggleSection>

                    <ToggleSection title="Payment and Refund Policy">
                        <Typography>
                            Courses on the platform are paid. Refunds are handled according to the system owner's refund policy, which can be provided upon request by contacting the owner.
                        </Typography>
                    </ToggleSection>

                    <ToggleSection title="User Conduct">
                        <Typography>
                            Users are expected to adhere to standard behavior, including respect for others and adherence to the platform's rules. Non-adherence to these Terms and Conditions may result in suspension of the user's account.
                        </Typography>
                    </ToggleSection>

                    <ToggleSection title="Data Collection and Privacy">
                        <Typography>
                            We collect data including name, email, phone number, and optionally, an image and address. We also collect data on courses purchased, session times, and grades. This data is used for analytics and personalized offers and is stored in our cloud database. We do not share this data with third parties.
                        </Typography>
                    </ToggleSection>

                    <ToggleSection title="Intellectual Property">
                        <Typography>
                            We do not hold any trademarks, copyrights, or patents related to our platform. Intellectual property rights for user-generated content are not managed by the platform.
                        </Typography>
                    </ToggleSection>

                    <ToggleSection title="Changes to Terms and Conditions">
                        <Typography>
                            The platform owner reserves the right to modify these Terms and Conditions as needed. Users will be notified of any changes via email.
                        </Typography>
                    </ToggleSection>

                    <ToggleSection title="Governing Law">
                        <Typography>
                            These Terms and Conditions are governed by the laws of Egypt.
                        </Typography>
                    </ToggleSection>

                    <ToggleSection title="Contact Us">
                        <Typography>
                            If you have any questions or concerns about these Terms and Conditions, please contact us at: <Link href="mailto:info@megz.com" className="text-primary underline">info@megz.com</Link>.
                        </Typography>
                    </ToggleSection>
                </div>
            </div>
        </LandingLayout>
    );
};

export default TermsAndConditionsPage;
