import AppLayout from "@/components/pages/adminLayout/AppLayout";
import { TicketsClient } from "@/components/admin/operationsManagement/ticketsComponents/TicketsClient";
import { TicketsForm } from "@/components/admin/operationsManagement/ticketsComponents/TicketsForm";
import { Button } from "@/components/ui/button";
import CommingSoon from "@/components/ui/CommingSoon";
import Modal from "@/components/ui/modal";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export default function TicketsPage() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <AppLayout>
            <CommingSoon />
        </AppLayout>
    )

    return (
        <AppLayout>
            <div className="flex w-full flex-col gap-4">
                <div className="flex justify-between">
                    <div className="flex flex-col gap-2">
                        <ConceptTitle>Tickets</ConceptTitle>
                    </div>
                    <Button onClick={() => setIsOpen(true)} customeColor={"primary"}>
                        <PlusIcon className="mr-2"></PlusIcon>
                        <Typography variant={"buttonText"}>Add</Typography>
                    </Button>
                </div>
                <Modal
                    title="Create a Ticket"
                    description="Add a new ticket"
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    children={(
                        <TicketsForm setIsOpen={setIsOpen}></TicketsForm>
                    )}
                />
                <PaperContainer>
                    <TicketsClient />
                </PaperContainer>
            </div>
        </AppLayout>
    );
}
