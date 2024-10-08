import LandingLayout from '@/components/landingPageComponents/LandingLayout';
import { ToggleSection } from '@/components/ui/ToggleSection';
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy';
import Head from 'next/head';
import Link from 'next/link';

const PrivacyPolicyPage = () => {
    return (
        <LandingLayout>
            <Head>
                <title>Privacy Policy | Megz Courses</title>
                <meta name="description" content="Privacy Policy for Megz Courses" />
                <meta name="robots" content="index, follow" />
            </Head>
            <div className="max-w-6xl mx-auto p-6">
                <Typography className="text-primary mb-3" variant={"secondary"}>Megz Learning</Typography>
                <ConceptTitle className="mb-2 !text-6xl">Privacy Policy</ConceptTitle>
                <Typography className='block mb-12 text-muted'>19<sup>th</sup> September 2024</Typography>

                <div className="space-y-4">
                    <ToggleSection title="Overview" defaultIsOpen>
                        <Typography>
                            Welcome to Megz Courses! This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our app integrated with Meta (formerly Facebook) services, including our Facebook Page, Messenger bot, or other Meta platforms.
                        </Typography>
                    </ToggleSection>

                    <ToggleSection title="Information We Collect">
                        <ToggleSection title='We may collect the following types of information:' primaryColor defaultIsOpen>
                            <ul className="ml-4 list-disc">
                                <li>Personal Information: This includes information you provide directly, such as your name, email address, phone number, and any other personal details you share through Meta platforms.</li>
                                <li>Meta Platform Data: Data collected through Meta platforms, such as user interactions with our Messenger bot, Facebook Page, or other Meta services.</li>
                                <li>Usage Data: Information about your interactions with our app, including how you use our services and your preferences.</li>
                                <li>Device Information: Information about your device, including IP address, browser type, operating system, and other technical details.</li>
                            </ul>
                        </ToggleSection>
                    </ToggleSection>

                    <ToggleSection title="How We Use Your Information">
                        <ToggleSection title='We use your information for the following purposes:' primaryColor defaultIsOpen>
                            <ul className="list-disc list-inside">
                                <li>To provide, operate, and maintain our services on Meta platforms.</li>
                                <li>To improve, personalize, and expand our services.</li>
                                <li>To process transactions and manage your orders.</li>
                                <li>To communicate with you, including sending updates and promotional materials related to our services.</li>
                                <li>To analyze user interactions and improve our app's performance and user experience.</li>
                            </ul>
                        </ToggleSection>
                    </ToggleSection>

                    <ToggleSection title="How We Share Your Information">
                        <ToggleSection title='We do not sell or rent your personal information. We may share your information with:' primaryColor defaultIsOpen>
                            <ul className="list-disc list-inside">
                                <li>Service Providers: Third-party vendors who assist us in providing and managing our services on Meta platforms.</li>
                                <li>Meta Platforms: Information may be shared with Meta for the purpose of operating and maintaining our integrations with their services.</li>
                                <li>Legal Requirements: When required by law or to protect our rights, property, or safety.</li>
                                <li>Business Transfers: In connection with a merger, acquisition, or sale of all or a portion of our assets.</li>
                            </ul>
                        </ToggleSection>
                    </ToggleSection>

                    <ToggleSection title="Your Choices and Rights">
                        <ToggleSection title='You have the following rights regarding your personal information:' primaryColor defaultIsOpen>
                            <ul className="list-disc list-inside">
                                <li>Access and Correction: You can request access to your personal information and request corrections if needed.</li>
                                <li>Opt-Out: You can opt-out of receiving promotional communications from us.</li>
                                <li>Data Deletion: You can request the deletion of your personal information by contacting us.</li>
                            </ul>
                        </ToggleSection>
                    </ToggleSection>

                    <ToggleSection title="Security">
                        <Typography>We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no security system is impenetrable, and we cannot guarantee the absolute security of your information.</Typography>
                    </ToggleSection>

                    <ToggleSection title="Third-Party Links">
                        <Typography>Our app may contain links to third-party websites or services, including Meta services. We are not responsible for the privacy practices or content of these third parties.</Typography>
                    </ToggleSection>

                    <ToggleSection title="Meta Platform Compliance">
                        <Typography>Our app complies with Meta’s Platform Policies and Data Use Policy. For more information on how Meta handles your data, please refer to their <Link target='_blank' className='text-primary hover:underline underline-offset-4' href="https://www.facebook.com/privacy/policy">Data Policy</Link> and <Link target='_blank' className='text-primary hover:underline underline-offset-4' href="https://developers.facebook.com/terms/">Platform Policies</Link>.</Typography>
                    </ToggleSection>

                    <ToggleSection title="Children’s Privacy">
                        <Typography>Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.</Typography>
                    </ToggleSection>

                    <ToggleSection title="Changes to This Privacy Policy">
                        <Typography>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Your continued use of our services constitutes your acceptance of the revised Privacy Policy.</Typography>
                    </ToggleSection>

                    <ToggleSection title="Contact Us">
                        <Typography>
                            If you have any questions or concerns about this Privacy Policy or our practices, please contact us at: <Link href="mailto:info@megz.com" className="text-primary underline">info@megz.com</Link>.
                        </Typography>
                    </ToggleSection>
                </div>
            </div>
        </LandingLayout>
    );
};

export default PrivacyPolicyPage;
