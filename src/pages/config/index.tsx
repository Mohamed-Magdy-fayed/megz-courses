import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { ApiAlert } from "@/components/ui/api-alert";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowRightFromLineIcon, PlusSquare } from "lucide-react";
import type { NextPage } from "next";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import Modal from "@/components/ui/modal";
import { useEffect, useState } from "react";
import ZoomAccountForm from "@/components/zoomAccount/ZoomAccountForm";
import { PaperContainer } from "@/components/ui/PaperContainers";
import ZoomAccountsClient from "@/components/zoomAccount/ZoomAccountsClient";
import { useRouter } from "next/router";
import { SiteIdentityForm } from "@/components/siteIdentity/SiteIdentityForm";
import { api } from "@/lib/api";
import { LogoAccent } from "@/components/layout/Logo";

const tabs = [
    { value: "site_identity", label: "Site Identity" },
    { value: "zoom_accounts", label: "Zoom Accounts" },
    { value: "facebook", label: "Facebook Configuration" },
]

const ConfigPage: NextPage = () => {
    const router = useRouter();
    const tabName = router.query.tab as string;

    const [isZoomOpen, setIsZoomOpen] = useState(false)
    const [tab, setTab] = useState("site_identity");

    const { data } = api.siteIdentity.getSiteIdentity.useQuery()

    useEffect(() => {
        if (!tabName) router.push(`config?tab=${tab}`)
        if (tabName) setTab(tabName)
    }, [tabName]);

    return (
        <AppLayout>
            <Modal
                description=""
                title="Add a zoom account"
                isOpen={isZoomOpen}
                onClose={() => setIsZoomOpen(false)}
                children={(
                    <ZoomAccountForm setIsOpen={setIsZoomOpen} />
                )}
            />
            <Tabs className="w-full" value={tab}>
                <TabsList className="w-full">
                    {tabs.map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            onClick={() => router.push(`config?tab=${tab.value}`)}
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value="facebook">
                    <ConceptTitle>Configure Facebook webhooks</ConceptTitle>
                    <ApiAlert title="webhook callback url" description="https://megz-courses.vercel.app/api/facebook" />
                    <div className="flex items-center justify-between p-4">
                        <Typography>once verified successfully your potintial customers will be added to your database</Typography>
                        <Link href={`/database`}>
                            <Button className="whitespace-nowrap space-x-2" customeColor={"primaryOutlined"} variant={"outline"}>
                                <Typography variant={"buttonText"}>Go to Database</Typography>
                                <ArrowRightFromLineIcon></ArrowRightFromLineIcon>
                            </Button>
                        </Link>
                    </div>
                </TabsContent>
                <TabsContent value="zoom_accounts">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between w-full">
                            <ConceptTitle>Zoom Accounts</ConceptTitle>
                            <Button onClick={() => setIsZoomOpen(true)} >
                                <PlusSquare className="w-4 h-4 mr-2" />
                                Add an account
                            </Button>
                        </div>
                        <PaperContainer>
                            <ZoomAccountsClient />
                        </PaperContainer>
                    </div>
                </TabsContent>
                <TabsContent value="site_identity">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between w-full">
                            <ConceptTitle>Site Identity</ConceptTitle>
                        </div>
                        <PaperContainer>
                            {
                                data?.siteIdentity && <SiteIdentityForm initialData={data.siteIdentity} />
                            }
                        </PaperContainer>
                    </div>
                </TabsContent>
            </Tabs>
        </AppLayout>
    )
}

export default ConfigPage
