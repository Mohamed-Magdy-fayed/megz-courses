import ContactSection from '@/components/landingPageComponents/ContactSection';
import LandingLayout from '@/components/landingPageComponents/LandingLayout';
import { ToggleSection } from '@/components/ui/ToggleSection';
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy';
import { env } from '@/env.mjs';
import Head from 'next/head';
import Link from 'next/link';

const SupportPage = () => {
    return (
        <LandingLayout>
            <Head>
                <title>Support | Gateling TMS</title>
                <meta name="description" content="Support information for Gateling TMS" />
                <meta name="robots" content="index, follow" />
            </Head>
            <div className="max-w-6xl mx-auto p-6">
                <Typography className="text-primary mb-3" variant={"secondary"}>Gateling TMS</Typography>
                <ConceptTitle className="mb-2 !text-6xl">Support</ConceptTitle>
                <Typography className='block mb-12 text-muted'>19<sup>th</sup> September 2024</Typography>

                <div className="space-y-4">
                    <ToggleSection title="Overview" defaultIsOpen>
                        <Typography>
                            The Support page provides essential assistance to help small teaching organizations efficiently use the system. It includes FAQs, and direct help options to resolve issues quickly, ensuring that organizations can focus on teaching rather than administrative tasks.
                        </Typography>
                    </ToggleSection>

                    <ToggleSection title="FAQs">
                        <ToggleSection title="How do I reset my password?" primaryColor defaultIsOpen>
                            <Typography>
                                You can reset your password by clicking the "Forgot Password" link on the login page and following the instructions. You will get an email with a code and you will get asked to provide this code to reset the password.
                            </Typography>
                        </ToggleSection>
                        <ToggleSection title="What does this system do?" primaryColor defaultIsOpen>
                            <Typography>
                                Gateling TMS allows you to manage your small/medium-sized teaching organization by providing an easy and organized way for your team to work together you can get rid of all your spreadsheets and your data will be semlissley interacted with better than ever before
                            </Typography>
                        </ToggleSection>
                        <ToggleSection title="How much it will cost my business to access the system?" primaryColor defaultIsOpen>
                            <Typography>
                                Costs may vary depending on your organization’s size and needs please contact our team at <Link target='_blank' href={`mailto:${env.NEXT_PUBLIC_EMAIL}`}>{env.NEXT_PUBLIC_EMAIL}</Link> to have an officil price proposal
                            </Typography>
                        </ToggleSection>
                        <ToggleSection title="Is this the final status of the system?" primaryColor defaultIsOpen>
                            <Typography>
                                As of the date of this document, the system is not in its final state as more features will be added soon to accommodate for the needs of the businesses using it.
                            </Typography>
                        </ToggleSection>
                    </ToggleSection>

                    <ToggleSection title="Help resources">
                        <Typography>
                            You can find additional tutorials and guides on our Facebook page
                            <br />
                            <Link className="text-primary underline" href="https://www.facebook.com/gatelingsolutions/" target='_blank'>Gateling TMS</Link> and on the <Link className="text-primary underline" href="/documentation" target='_blank'>documentation page</Link>
                        </Typography>
                    </ToggleSection>
                </div>
            </div>
            <ContactSection />
        </LandingLayout>
    );
};

export default SupportPage;
