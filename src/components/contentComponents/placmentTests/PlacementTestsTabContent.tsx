import { PaperContainer } from "@/components/ui/PaperContainers";
import { Typography } from "@/components/ui/Typoghraphy";
import PlacmentTestClient from "@/components/contentComponents/placmentTests/PlacmentTestsClient";
import PlacmentTestScheduleClient from "@/components/contentComponents/placmentTestSchedule/PlacmentTestScheduleClient";
import PlacmentTestSubmissionsClient from "@/components/contentComponents/placmentTestSubmissions/PlacmentTestSubmissionsClient";
import { PlacmentTestRow } from "@/components/contentComponents/placmentTests/PlacmentTestsColumn";
import { PlacmentTestScheduleRow } from "@/components/contentComponents/placmentTestSchedule/PlacmentTestScheduleColumn";
import { PlacementTestSubmissionsRow } from "@/components/contentComponents/placmentTestSubmissions/PlacmentTestSubmissionsColumn";

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