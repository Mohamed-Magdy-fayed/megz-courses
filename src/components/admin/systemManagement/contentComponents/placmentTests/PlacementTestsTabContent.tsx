import { PaperContainer } from "@/components/ui/PaperContainers";
import { Typography } from "@/components/ui/Typoghraphy";
import PlacmentTestClient from "@/components/admin/systemManagement/contentComponents/placmentTests/PlacmentTestsClient";
import PlacmentTestScheduleClient from "@/components/admin/systemManagement/contentComponents/placmentTestSchedule/PlacmentTestScheduleClient";
import PlacmentTestSubmissionsClient from "@/components/admin/systemManagement/contentComponents/placmentTestSubmissions/PlacmentTestSubmissionsClient";
import { PlacmentTestRow } from "@/components/admin/systemManagement/contentComponents/placmentTests/PlacmentTestsColumn";
import { PlacmentTestScheduleRow } from "@/components/admin/systemManagement/contentComponents/placmentTestSchedule/PlacmentTestScheduleColumn";
import { PlacementTestSubmissionsRow } from "@/components/admin/systemManagement/contentComponents/placmentTestSubmissions/PlacmentTestSubmissionsColumn";

const PlacementTestsTabContent = ({ placementTests, placementTestsSchedule, placementTestSubmissions }: {
    placementTests: PlacmentTestRow[],
    placementTestsSchedule: PlacmentTestScheduleRow[],
    placementTestSubmissions: PlacementTestSubmissionsRow[],
}) => {
    return (
        <>
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