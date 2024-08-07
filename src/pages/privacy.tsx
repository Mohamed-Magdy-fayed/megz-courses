import LandingLayout from '@/components/landingPageComponents/LandingLayout';
import { PaperContainer } from '@/components/ui/PaperContainers';
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy';
import { env } from '@/env.mjs';
import { format } from 'date-fns';
import Head from 'next/head';

const PrivacyPolicyPage = () => {
    return (
        <LandingLayout>
            <Head>
                <title>Privacy Policy | Megz Courses</title>
                <meta name="description" content="Privacy Policy for Megz Courses" />
                <meta name="robots" content="index, follow" />
            </Head>
            <div className="p-12 space-y-8">
                <ConceptTitle className="text-2xl font-semibold mb-4">Privacy Policy</ConceptTitle>

                <Typography><strong>Effective Date:</strong> {format(new Date("7/aug/2024"), "PPP")}</Typography>

                <div>
                    <Typography variant={"primary"}>1. Introduction</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>Welcome to Megz Courses! This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our app integrated with Meta (formerly Facebook) services, including our Facebook Page, Messenger bot, or other Meta platforms.</Typography>
                    </div>
                </div>

                <div>
                    <Typography variant={"primary"}>2. Information We Collect</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography variant={"secondary"}>We may collect the following types of information:</Typography>
                        <ol className="list-disc list-inside space-y-2">
                            <li><strong>Personal Information:</strong> This includes information you provide directly, such as your name, email address, phone number, and any other personal details you share through Meta platforms.</li>
                            <li><strong>Meta Platform Data:</strong> Data collected through Meta platforms, such as user interactions with our Messenger bot, Facebook Page, or other Meta services.</li>
                            <li><strong>Usage Data:</strong> Information about your interactions with our app, including how you use our services and your preferences.</li>
                            <li><strong>Device Information:</strong> Information about your device, including IP address, browser type, operating system, and other technical details.</li>
                        </ol>
                    </div>
                </div>

                <div>
                    <Typography variant={"primary"}>3. How We Use Your Information</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography variant={"secondary"}>We use your information for the following purposes:</Typography>
                        <ol className="list-disc list-inside">
                            <li>To provide, operate, and maintain our services on Meta platforms.</li>
                            <li>To improve, personalize, and expand our services.</li>
                            <li>To process transactions and manage your orders.</li>
                            <li>To communicate with you, including sending updates and promotional materials related to our services.</li>
                            <li>To analyze user interactions and improve our app's performance and user experience.</li>
                        </ol>
                    </div>
                </div>

                <div>
                    <Typography variant={"primary"}>4. How We Share Your Information</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography variant={"secondary"}>We do not sell or rent your personal information. We may share your information with:</Typography>
                        <ol className="list-disc list-inside">
                            <li><strong>Service Providers:</strong> Third-party vendors who assist us in providing and managing our services on Meta platforms.</li>
                            <li><strong>Meta Platforms:</strong> Information may be shared with Meta for the purpose of operating and maintaining our integrations with their services.</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights, property, or safety.</li>
                            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of all or a portion of our assets.</li>
                        </ol>
                    </div>
                </div>

                <div>
                    <Typography variant={"primary"}>5. Your Choices and Rights</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>You have the following rights regarding your personal information:</Typography>
                        <ol className="list-disc list-inside">
                            <li><strong>Access and Correction:</strong> You can request access to your personal information and request corrections if needed.</li>
                            <li><strong>Opt-Out:</strong> You can opt-out of receiving promotional communications from us.</li>
                            <li><strong>Data Deletion:</strong> You can request the deletion of your personal information by contacting us.</li>
                        </ol>
                    </div>
                </div>

                <div>
                    <Typography variant={"primary"}>6. Security</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no security system is impenetrable, and we cannot guarantee the absolute security of your information.</Typography>
                    </div>
                </div>
                <div>
                    <Typography variant={"primary"}>7. Third-Party Links</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>Our app may contain links to third-party websites or services, including Meta services. We are not responsible for the privacy practices or content of these third parties.</Typography>
                    </div>
                </div>
                <div>
                    <Typography variant={"primary"}>8. Meta Platform Compliance</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>Our app complies with Meta’s Platform Policies and Data Use Policy. For more information on how Meta handles your data, please refer to their <a href="https://www.facebook.com/privacy/policy" className="text-blue-500 underline">Data Policy</a> and <a href="https://developers.facebook.com/policy/" className="text-blue-500 underline">Platform Policies</a>.</Typography>
                    </div>
                </div>
                <div>
                    <Typography variant={"primary"}>9. Children’s Privacy</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.</Typography>
                    </div>
                </div>
                <div>
                    <Typography variant={"primary"}>10. Changes to This Privacy Policy</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Your continued use of our services constitutes your acceptance of the revised Privacy Policy.</Typography>
                    </div>
                </div>
                <div>
                    <Typography variant={"primary"}>11. Contact Us</Typography>
                    <div className="py-2 px-10 space-y-4">
                        <Typography>If you have any questions or concerns about this Privacy Policy or our practices, please contact us at:</Typography>
                        <div className='grid'>
                            <Typography><strong>Megz Courses</strong></Typography>
                            <Typography>Email: <a href={`mailto:${env.NEXT_PUBLIC_GMAIL_EMAIL}`} className="text-info underline">{env.NEXT_PUBLIC_GMAIL_EMAIL}</a></Typography>
                        </div>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
};

export default PrivacyPolicyPage;
