import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import AppLayout from "@/components/pages/adminLayout/AppLayout";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import LeadsClient from "@/components/admin/salesManagement/leads/LeadsClient";
import { Button, SpinnerButton } from "@/components/ui/button";
import { Edit, LinkIcon, ListChecks, ChevronDownIcon, PlusSquare, Trash } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import LeadsForm from "@/components/admin/salesManagement/leads/LeadsForm";
import StageForm from "@/components/admin/salesManagement/leads/StageForm";
import DeleteStageForm from "@/components/admin/salesManagement/leads/DeleteStageForm";
import MoveStageForm from "@/components/admin/salesManagement/leads/MoveStageForm";
import { api } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { toastType, useToast } from "@/components/ui/use-toast";
import SelectField from "@/components/ui/SelectField";
import { formatPercentage } from "@/lib/utils";
import { ArrowRightToLine } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Lead } from "@/components/admin/salesManagement/leads/LeadsColumn";
import Link from "next/link";
import { SeverityPill } from "@/components/ui/SeverityPill";
import GoBackButton from "@/components/ui/go-back";
import AllLeadsClient from "@/components/admin/salesManagement/leads/AllLeadsClient";

const LeadsPage: NextPage = () => {
    const [isAddLeadOpen, setIsAddLeadOpen] = useState(false)
    const [isAddStageOpen, setIsAddStageOpen] = useState(false)
    const [isDeleteStageOpen, setIsDeleteStageOpen] = useState(false)
    const [isMoveStageOpen, setIsMoveStageOpen] = useState(false)
    const [isManageOpen, setIsManageOpen] = useState(false)
    const [resetSelection, setResetSelection] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [values, setValues] = useState<string[]>([])
    const [selectedLeads, setSelectedLeads] = useState<Lead[]>([])

    const { toast } = useToast()
    const trpcUtils = api.useUtils()

    const { data: stagesData, isLoading, refetch } = api.leadStages.getLeadStages.useQuery()
    const { data: labelsData } = api.leadLabels.getLeadLabels.useQuery()
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

    const moveLeadsMutation = api.leads.moveLeads.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            successMessageFormatter: ({ updatedLeads }) => {
                setResetSelection(!resetSelection)
                return `${updatedLeads.count} Leads moved`
            },
        })
    )

    const onAssignAll = (stageId?: string) => {
        assignAllMutation.mutate({
            stageId,
        })
    }

    const onMoveAll = (toStageId: string) => {
        const leadIds = selectedLeads.map(lead => lead.id)
        if (leadIds.length === 0) return toast({ variant: "info", title: "Please select the leads you want to move!" })
        moveLeadsMutation.mutate({ leadIds, toStageId })
    }

    const handleImport = (data: { name: string, email: string, phone: string }[]) => {
        importLeadsMutation.mutate(data);
    }

    return (
        <AppLayout>
            <main className="w-full">
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
                            <GoBackButton />
                            <ConceptTitle>Leads</ConceptTitle>
                            <Typography>Explore all sales leads</Typography>
                        </div>
                        <div className="flex gap-4 items-center">
                            <Link href={`/admin/sales_management/leads/my_leads`}>
                                <Button variant={"link"}>
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    <Typography>
                                        My Leads
                                    </Typography>
                                </Button>
                            </Link>
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
                                <TabsList className="animate-pulse">
                                    <TabsTrigger value="0">All</TabsTrigger>
                                    <TabsTrigger value="1">Intake</TabsTrigger>
                                    <TabsTrigger value="2">Qualified</TabsTrigger>
                                    <TabsTrigger value="3">Converted</TabsTrigger>
                                    <TabsTrigger value="2">Not Qualified</TabsTrigger>
                                    <TabsTrigger value="2">Lost</TabsTrigger>
                                </TabsList>
                            ) : (
                                <TabsList>
                                    <TabsTrigger value="all" className="flex items-center gap-2">
                                        <Typography>All</Typography>
                                        <SeverityPill color="info" className="aspect-square">
                                            {stagesData?.stages.flatMap(s => s.leads).length}
                                        </SeverityPill>
                                    </TabsTrigger>
                                    {stagesData?.stages.map(stage => (
                                        <TabsTrigger key={`${stage.id}trigger`} className="flex items-center gap-2" value={stage.name}>
                                            <Typography>{stage.name}</Typography>
                                            <SeverityPill color="info" className="aspect-square">
                                                {stage.leads.length}
                                            </SeverityPill>
                                        </TabsTrigger>
                                    ))}
                                    <Button customeColor={"mutedIcon"} onClick={() => setIsManageOpen(!isManageOpen)}>
                                        Manage Stages <ChevronDownIcon className="w-4 h-4" />
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
                        {stagesData?.stages && (
                            <TabsContent value="all">
                                <div className="flex justify-start gap-4">
                                    <div className="flex flex-col gap-4 md:flex-row">
                                        <SpinnerButton
                                            icon={ListChecks}
                                            text={`Assign All`}
                                            isLoading={!!loadingToast} customeColor={"info"} onClick={() => onAssignAll()}
                                        />
                                    </div>
                                    <div className="flex-shrink">
                                        <SelectField
                                            data={[...(labelsData?.leadLabels.map(label => ({
                                                Active: true,
                                                label: label.value,
                                                value: label.value,
                                            })) || []), {
                                                Active: true,
                                                label: "No Labels",
                                                value: "No Labels",
                                            }]}
                                            listTitle="Labels"
                                            placeholder="Select Label"
                                            setValues={setValues}
                                            values={values}
                                            multiSelect
                                        />
                                    </div>
                                </div>
                                <Typography className="text-destructive">Convertion Rate {formatPercentage(stagesData.stages.filter(stage => stage.defaultStage === "Converted").flatMap(stage => stage.leads).length / stagesData.stages.flatMap(stage => stage.leads).length * 100)}</Typography>
                                <AllLeadsClient
                                    leads={values.length > 0 ? stagesData.stages.flatMap(s => s.leads).filter(lead => lead.labels.some(label => values.some(val => label.value === val))) : stagesData.stages.flatMap(s => s.leads)}
                                    resetSelection={resetSelection}
                                    stagesData={stagesData.stages}
                                    handleImport={handleImport}
                                    setSelectedLeads={setSelectedLeads}
                                />
                            </TabsContent>
                        )}
                        {stagesData?.stages.map(stage => (
                            <TabsContent key={stage.id} value={stage.name}>
                                <div className="flex items-end justify-between gap-4 md:justify-start">
                                    <div className="flex flex-col gap-4 md:flex-row">
                                        <SpinnerButton
                                            icon={ListChecks}
                                            text={`Assign All ${stage.name}`}
                                            isLoading={!!loadingToast} customeColor={"info"} onClick={() => onAssignAll(stage.id)}
                                        />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <SpinnerButton
                                                    icon={ListChecks}
                                                    text="Bulk Move"
                                                    isLoading={!!loadingToast} customeColor={"primary"}
                                                />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel>Move To Stage</DropdownMenuLabel>
                                                {stagesData.stages.map(toStage => (
                                                    <DropdownMenuItem key={toStage.id} disabled={toStage.name === stage.name} onClick={() => onMoveAll(toStage.id)}>
                                                        {toStage.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div>
                                        <SelectField
                                            data={[...(labelsData?.leadLabels.map(label => ({
                                                Active: true,
                                                label: label.value,
                                                value: label.value,
                                            })) || []), {
                                                Active: true,
                                                label: "No Labels",
                                                value: "No Labels",
                                            }]}
                                            listTitle="Labels"
                                            placeholder="Select Label"
                                            setValues={setValues}
                                            values={values}
                                            multiSelect
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 justify-between p-4 md:justify-start md:gap-8">
                                    <Typography className="text-info">Intake {stagesData.stages.flatMap(stage => stage.leads).length}</Typography>
                                    <ArrowRightToLine />
                                    <Typography className="text-success">Converted {stagesData.stages.filter(stage => stage.defaultStage === "Converted").flatMap(stage => stage.leads).length}</Typography>
                                    <ArrowRightToLine />
                                    <Typography className="text-destructive">Convertion Rate {formatPercentage(stagesData.stages.filter(stage => stage.defaultStage === "Converted").flatMap(stage => stage.leads).length / stagesData.stages.flatMap(stage => stage.leads).length * 100)}</Typography>
                                </div>
                                <LeadsClient
                                    stage={{
                                        ...stage,
                                        leads: values.length > 0 ? stage.leads.filter(lead => lead.labels.some(label => values.some(val => label.value === val))) : stage.leads
                                    }}
                                    resetSelection={resetSelection}
                                    stagesData={stagesData.stages}
                                    handleImport={handleImport}
                                    setSelectedLeads={setSelectedLeads}
                                />
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </main>
        </AppLayout>
    );
}

export default LeadsPage