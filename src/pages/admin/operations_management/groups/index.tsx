import AppLayout from "@/components/pages/adminLayout/AppLayout";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import ZoomGroupForm from "@/components/admin/operationsManagement/zoomGroupsComponents/Form";
import ZoomGroupsClient from "@/components/admin/operationsManagement/zoomGroupsComponents/Client";
import { PlusIcon } from "lucide-react";
import type { NextPage } from "next";
import { useState } from "react";

const GroupsPage: NextPage = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Zoom Groups</ConceptTitle>
                        </div>
                        <Button onClick={() => setIsOpen(true)} customeColor={"primary"}>
                            <PlusIcon className="mr-2"></PlusIcon>
                            <Typography variant={"buttonText"}>Create</Typography>
                        </Button>
                    </div>
                    <Modal
                        isOpen={isOpen}
                        title="Create Zoom Group"
                        description="add a new group"
                        onClose={() => setIsOpen(false)}
                        children={(
                            <ZoomGroupForm setIsOpen={setIsOpen}></ZoomGroupForm>
                        )}
                    />
                    <ZoomGroupsClient />
                </div>
            </main>
        </AppLayout>
    )
}

export default GroupsPage
