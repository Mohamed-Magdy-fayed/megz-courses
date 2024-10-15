import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import AppLayout from "@/components/layout/AppLayout";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import LeadsClient from "@/components/leads/LeadsClient";
import { Button, SpinnerButton } from "@/components/ui/button";
import { Edit, ListChecks, MoreVertical, PlusSquare, Trash } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import LeadsForm from "@/components/leads/LeadsForm";
import StageForm from "@/components/leads/StageForm";
import DeleteStageForm from "@/components/leads/DeleteStageForm";
import MoveStageForm from "@/components/leads/MoveStageForm";
import { api } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { toastType, useToast } from "@/components/ui/use-toast";

const LeadsPage: NextPage = () => {
    const [isAddLeadOpen, setIsAddLeadOpen] = useState(false)
    const [isAddStageOpen, setIsAddStageOpen] = useState(false)
    const [isDeleteStageOpen, setIsDeleteStageOpen] = useState(false)
    const [isMoveStageOpen, setIsMoveStageOpen] = useState(false)
    const [isManageOpen, setIsManageOpen] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const { toast } = useToast()
    const trpcUtils = api.useUtils()

    const { data: stagesData, isLoading } = api.leadStages.getLeadStages.useQuery()
    const assignAllMutation = api.leads.assignAll.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Working...",
            successMessageFormatter: ({ updatedLeads }) => `${updatedLeads.length} Leads Assigned!`,
        })
    )
    const importLeadsMutation = api.leads.import.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Importing...",
            successMessageFormatter: ({ count }) => `${count} Leads Created!`,
        })
    )

    const onAssignAll = (stageId: string) => {
        assignAllMutation.mutate({
            stageId,
        })
    }

    const handleImport = (data: { name: string, email: string, phone: string }[]) => {
        importLeadsMutation.mutate(data);
    }

    return (
        <AppLayout>
            <main className="flex">
                <Modal
                    title="Add a lead"
                    description=""
                    isOpen={isAddLeadOpen}
                    onClose={() => setIsAddLeadOpen(false)}
                >
                    <LeadsForm setIsOpen={setIsAddLeadOpen} />
                </Modal>
                <Modal
                    title="Add a stage"
                    description=""
                    isOpen={isAddStageOpen}
                    onClose={() => setIsAddStageOpen(false)}
                >
                    <StageForm setIsOpen={setIsAddStageOpen} />
                </Modal>
                <Modal
                    title="Change a stage order"
                    description="Default Stages can't be deleted"
                    isOpen={isMoveStageOpen}
                    onClose={() => setIsMoveStageOpen(false)}
                >
                    <MoveStageForm setIsOpen={setIsMoveStageOpen} />
                </Modal>
                <Modal
                    title="Delete a stage"
                    description="Default Stages can't be deleted"
                    isOpen={isDeleteStageOpen}
                    onClose={() => setIsDeleteStageOpen(false)}
                >
                    <DeleteStageForm setIsOpen={setIsDeleteStageOpen} />
                </Modal>
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Leads</ConceptTitle>
                            <Typography>Explore all your sales leads</Typography>
                        </div>
                        <div className="flex gap-2 items-stretch">
                            <Button onClick={() => setIsAddLeadOpen(true)}>
                                <PlusSquare className="w-4 h-4" />
                                <Typography>
                                    Create a Lead
                                </Typography>
                            </Button>
                        </div>
                    </div>
                    <Tabs className="w-full" defaultValue="Intake" id="leads">
                        {isLoading ? (
                            <TabsList className="animate-pulse w-full">
                                <TabsTrigger value="1">Intake</TabsTrigger>
                                <TabsTrigger value="2">Qualified</TabsTrigger>
                                <TabsTrigger value="3">Converted</TabsTrigger>
                                <TabsTrigger value="2">Not Qualified</TabsTrigger>
                                <TabsTrigger value="2">Lost</TabsTrigger>
                            </TabsList>
                        ) : (
                            <TabsList className="w-full">
                                {stagesData?.stages.map(stage => (
                                    <TabsTrigger key={`${stage.id}trigger`} value={stage.name}>{stage.name}</TabsTrigger>
                                ))}
                                <Button customeColor={"mutedIcon"} onClick={() => setIsManageOpen(!isManageOpen)}>
                                    Manage Stages <MoreVertical className="w-4 h-4" />
                                </Button>
                            </TabsList>
                        )}
                        <Accordion type="single" collapsible value={isManageOpen ? "Manage Stages" : undefined}>
                            <AccordionItem value="Manage Stages" >
                                <AccordionContent>
                                    <div className="flex items-center space-x-4 w-full justify-center">
                                        <Button onClick={() => setIsAddStageOpen(true)}>
                                            <PlusSquare className="w-4 h-4" />
                                            <Typography>
                                                Create a Stage
                                            </Typography>
                                        </Button>
                                        <Button onClick={() => setIsMoveStageOpen(true)}>
                                            <Edit className="w-4 h-4" />
                                            <Typography>
                                                Change order
                                            </Typography>
                                        </Button>
                                        <Button customeColor={"destructive"} onClick={() => setIsDeleteStageOpen(true)}>
                                            <Trash className="w-4 h-4" />
                                            <Typography>
                                                Delete
                                            </Typography>
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        {stagesData?.stages.map(stage => (
                            <TabsContent value={stage.name}>
                                <PaperContainer>
                                    <SpinnerButton
                                        icon={ListChecks}
                                        text={`Assign All ${stage.name}`}
                                        isLoading={!!loadingToast} customeColor={"info"} onClick={() => onAssignAll(stage.id)}
                                    />
                                    <LeadsClient stage={stage} stagesData={stagesData.stages} handleImport={handleImport} />
                                </PaperContainer>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </main>
        </AppLayout>
    );
}

export default LeadsPage