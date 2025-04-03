import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/pages/adminLayout/AppLayout";
import { PlusSquare } from "lucide-react";
import type { NextPage } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import Modal from "@/components/ui/modal";
import { useEffect, useState } from "react";
import { SiteIdentityForm } from "@/components/admin/operationsManagement/siteIdentity/SiteIdentityForm";
import { api } from "@/lib/api";
import MetaConfigTab from "@/components/admin/systemManagement/systemConfigurations/MetaConfigTab";
import WhatsappConfigTab from "@/components/admin/systemManagement/systemConfigurations/WhatsappConfigTab";
import ParamsConfigTab from "@/components/admin/systemManagement/systemConfigurations/ParamsConfigTab";
import OnMeetingAccountForm from "@/components/admin/systemManagement/config/onMeetingAccount/OnMeetingAccountForm";
import ZoomAccountForm from "@/components/admin/systemManagement/config/zoomAccount/ZoomAccountForm";
import ZoomAccountsClient from "@/components/admin/systemManagement/config/zoomAccount/ZoomAccountsClient";
import GoogleAccountForm from "@/components/admin/systemManagement/config/googleAccount/GoogleAccountForm";
import GoogleAccountsClient from "@/components/admin/systemManagement/config/googleAccount/GoogleAccountsClient";

const tabs = [
    { value: "site_identity", label: "Site Identity" },
    { value: "zoom_accounts", label: "Zoom Accounts" },
    { value: "google_accounts", label: "Google Accounts" },
    { value: "sales_channels", label: "Sales Channels" },
    { value: "whatsapp_config", label: "WhatsApp" },
    { value: "params", label: "System Parameters" },
]

const ConfigPage: NextPage = () => {
    const [isZoomOpen, setIsZoomOpen] = useState(false)
    const [isOnMeetingOpen, setIsOnMeetingOpen] = useState(false)
    const [isGoogleOpen, setIsGoogleOpen] = useState(false)

    const { data, refetch } = api.siteIdentity.getSiteIdentity.useQuery(undefined, { enabled: false })

    useEffect(() => { refetch() }, [])

    return (
        <AppLayout>
            <Tabs className="w-full" id="config" defaultValue={"site_identity"}>
                <TabsList className="w-full">
                    {tabs.map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value="zoom_accounts">
                    <Modal
                        description=""
                        title="Add a zoom account"
                        isOpen={isZoomOpen}
                        onClose={() => setIsZoomOpen(false)}
                        children={(
                            <ZoomAccountForm setIsOpen={setIsZoomOpen} />
                        )}
                    />
                    <Modal
                        description=""
                        title="Add an onMeeting account"
                        isOpen={isOnMeetingOpen}
                        onClose={() => setIsOnMeetingOpen(false)}
                        children={(
                            <OnMeetingAccountForm setIsOpen={setIsOnMeetingOpen} />
                        )}
                    />
                    <div className="space-y-4">
                        <div className="flex items-center justify-between w-full">
                            <ConceptTitle>Zoom Accounts</ConceptTitle>
                            <div className="flex items-center gap-4">
                                <Button onClick={() => setIsOnMeetingOpen(true)} >
                                    <PlusSquare className="w-4 h-4 mr-2" />
                                    On Meeting
                                </Button>
                                <Button onClick={() => setIsZoomOpen(true)} >
                                    <PlusSquare className="w-4 h-4 mr-2" />
                                    Zoom
                                </Button>
                            </div>
                        </div>
                        <ZoomAccountsClient />
                    </div>
                </TabsContent>
                <TabsContent value="google_accounts">
                    <Modal
                        description=""
                        title="Add a google account"
                        isOpen={isGoogleOpen}
                        onClose={() => setIsGoogleOpen(false)}
                        children={(
                            <GoogleAccountForm setIsOpen={setIsGoogleOpen} />
                        )}
                    />
                    <div className="space-y-4">
                        <div className="flex items-center justify-between w-full">
                            <ConceptTitle>Google Accounts</ConceptTitle>
                            <Button onClick={() => setIsGoogleOpen(true)} >
                                <PlusSquare className="w-4 h-4 mr-2" />
                                Add an account
                            </Button>
                        </div>
                        <GoogleAccountsClient />
                    </div>
                </TabsContent>
                <TabsContent value="site_identity">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between w-full">
                            <ConceptTitle>Site Identity</ConceptTitle>
                        </div>
                        {
                            data?.siteIdentity && <SiteIdentityForm initialData={data.siteIdentity} />
                        }
                    </div>
                </TabsContent>
                <TabsContent value="sales_channels">
                    <MetaConfigTab />
                </TabsContent>
                <TabsContent value="whatsapp_config">
                    <WhatsappConfigTab />
                </TabsContent>
                <TabsContent value="params">
                    <ParamsConfigTab />
                </TabsContent>
            </Tabs>
        </AppLayout>
    )
}

export default ConfigPage
