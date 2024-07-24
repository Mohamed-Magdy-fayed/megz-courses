import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useState } from "react";
import { PlusSquare } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import AssignmentsClient from "@/components/contentComponents/assignments/AssignmentsClient";
import ConnectGoogleForm from "@/components/FormsComponents/ConnectGoogleForm";
import { Typography } from "@/components/ui/Typoghraphy";
import { AssignmentRow } from "@/components/contentComponents/assignments/AssignmentsColumn";
import CustomForm from "@/components/FormsComponents/CustomForm";

const AssignmentsTabContent = ({ data }: { data: AssignmentRow[] }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isGoogleOpen, setIsGoogleOpen] = useState(false)

    return (
        <>
            <Modal
                title="Create"
                description="Create Quiz or Assignment"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                children={(
                    <CustomForm setIsOpen={setIsOpen} />
                )}
            />
            <Modal
                title="Connect Google Form"
                description="Use a google form as an assignment or quiz"
                isOpen={isGoogleOpen}
                onClose={() => setIsGoogleOpen(false)}
                children={(
                    <ConnectGoogleForm setIsOpen={setIsGoogleOpen} />
                )}
            />
            <div className="p-4 space-x-4">
                <Button onClick={() => setIsOpen(true)}>
                    <PlusSquare />
                    <Typography>Add Assignment</Typography>
                </Button>
                <Button onClick={() => setIsGoogleOpen(true)}>
                    <PlusSquare />
                    <Typography>Add Google Form</Typography>
                </Button>
            </div>
            <PaperContainer>
                <AssignmentsClient formattedData={data} />
            </PaperContainer>
        </>
    )
}

export default AssignmentsTabContent