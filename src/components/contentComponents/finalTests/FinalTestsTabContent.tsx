import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PlusSquare } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Typography } from "@/components/ui/Typoghraphy";
import Modal from "@/components/ui/modal";
import CustomTestForm from "@/components/FormsComponents/CustomTestForm";
import CustomTestGoogleForm from "@/components/FormsComponents/CustomTestGoogleForm";
import FinalTestClient from "@/components/contentComponents/finalTests/FinalTestsClient";
import FinalTestSubmissionsClient from "@/components/contentComponents/finalTestSubmissions/FinalTestSubmissionsClient";
import { FinalTestRow } from "@/components/contentComponents/finalTests/FinalTestsColumn";
import { FinalTestSubmissionRow } from "@/components/contentComponents/finalTestSubmissions/FinalTestSubmissionsColumn";

const FinalTestsTabContent = ({ finalTests, finalTestSubmissions }: {
    finalTests: FinalTestRow[],
    finalTestSubmissions: FinalTestSubmissionRow[],
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isGoogleOpen, setIsGoogleOpen] = useState(false)

    return (
        <>
            <Modal
                title="Create"
                description="Create Placement or Final test"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                children={(
                    <CustomTestForm setIsOpen={setIsOpen} />
                )}
            />
            <Modal
                title="Connect Google Form"
                description="Use a google form as a Placement or Final test"
                isOpen={isGoogleOpen}
                onClose={() => setIsGoogleOpen(false)}
                children={(
                    <CustomTestGoogleForm setIsOpen={setIsGoogleOpen} />
                )}
            />
            <div className="p-4 space-x-4">
                <Button onClick={() => setIsOpen(true)}>
                    <PlusSquare />
                    <Typography>Add Placement Test</Typography>
                </Button>
                <Button onClick={() => setIsGoogleOpen(true)}>
                    <PlusSquare />
                    <Typography>Add Google Form</Typography>
                </Button>
            </div>
            <PaperContainer>
                <FinalTestClient formattedData={finalTests} />
            </PaperContainer>
            <Typography variant={"secondary"}>Submissions</Typography>
            <PaperContainer>
                <FinalTestSubmissionsClient formattedData={finalTestSubmissions} />
            </PaperContainer>
        </>
    )
}

export default FinalTestsTabContent