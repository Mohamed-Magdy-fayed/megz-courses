import { PaperContainer } from "@/components/ui/PaperContainers";
import { Typography } from "@/components/ui/Typoghraphy";
import FinalTestClient from "@/components/contentComponents/finalTests/FinalTestsClient";
import FinalTestSubmissionsClient from "@/components/contentComponents/finalTestSubmissions/FinalTestSubmissionsClient";
import { FinalTestRow } from "@/components/contentComponents/finalTests/FinalTestsColumn";
import { FinalTestSubmissionRow } from "@/components/contentComponents/finalTestSubmissions/FinalTestSubmissionsColumn";

const FinalTestsTabContent = ({ finalTests, finalTestSubmissions }: {
    finalTests: FinalTestRow[],
    finalTestSubmissions: FinalTestSubmissionRow[],
}) => {
    return (
        <>
            <PaperContainer>
                <Typography variant={"secondary"}>Final Tests</Typography>
                <FinalTestClient formattedData={finalTests} />
            </PaperContainer>
            <PaperContainer>
                <Typography variant={"secondary"}>Submissions</Typography>
                <FinalTestSubmissionsClient formattedData={finalTestSubmissions} />
            </PaperContainer>
        </>
    )
}

export default FinalTestsTabContent