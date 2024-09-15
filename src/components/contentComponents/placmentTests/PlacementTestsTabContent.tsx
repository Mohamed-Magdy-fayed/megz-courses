import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PlusSquare } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Typography } from "@/components/ui/Typoghraphy";
import PlacmentTestClient from "@/components/contentComponents/placmentTests/PlacmentTestsClient";
import PlacmentTestScheduleClient from "@/components/contentComponents/placmentTestSchedule/PlacmentTestScheduleClient";
import PlacmentTestSubmissionsClient from "@/components/contentComponents/placmentTestSubmissions/PlacmentTestSubmissionsClient";
import { PlacmentTestRow } from "@/components/contentComponents/placmentTests/PlacmentTestsColumn";
import { PlacmentTestScheduleRow } from "@/components/contentComponents/placmentTestSchedule/PlacmentTestScheduleColumn";
import { PlacementTestSubmissionsRow } from "@/components/contentComponents/placmentTestSubmissions/PlacmentTestSubmissionsColumn";
import Modal from "@/components/ui/modal";
import CustomTestForm from "@/components/FormsComponents/CustomTestForm";
import CustomTestGoogleForm from "@/components/FormsComponents/CustomTestGoogleForm";

const PlacementTestsTabContent = ({ placementTests, placementTestsSchedule, placementTestSubmissions }: {
    placementTests: PlacmentTestRow[],
    placementTestsSchedule: PlacmentTestScheduleRow[],
    placementTestSubmissions: PlacementTestSubmissionsRow[],
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
                <Typography variant={"secondary"}>The Tests</Typography>
                <PlacmentTestClient formattedData={placementTests} />
            </PaperContainer>
            <PaperContainer>
                <Typography variant={"secondary"}>Scheduled</Typography>
                <PlacmentTestScheduleClient
                    formattedData={placementTestsSchedule} />
            </PaperContainer>
            <PaperContainer>
                <Typography variant={"secondary"}>Submissions</Typography>
                <PlacmentTestSubmissionsClient formattedData={placementTestSubmissions} />
            </PaperContainer>
        </>
    )
}

export default PlacementTestsTabContent