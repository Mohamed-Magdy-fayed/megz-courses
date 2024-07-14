import AppLayout from "@/components/layout/AppLayout";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ZoomGroupForm from "@/components/zoomGroupsComponents/Form";
import ZoomGroupsClient from "@/components/zoomGroupsComponents/Client";
import { FileDown, FileUp, PlusIcon } from "lucide-react";
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
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={"icon"} customeColor={"infoIcon"}>
                                            <FileDown />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <Typography>Import</Typography>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={"icon"} customeColor={"infoIcon"}>
                                            <FileUp />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <Typography>Export</Typography>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
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
                    <PaperContainer>
                        <ZoomGroupsClient></ZoomGroupsClient>
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    )
}

export default GroupsPage
