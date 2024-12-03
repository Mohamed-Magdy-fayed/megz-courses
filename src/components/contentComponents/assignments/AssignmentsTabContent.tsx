import { PaperContainer } from "@/components/ui/PaperContainers";
import AssignmentsClient from "@/components/contentComponents/assignments/AssignmentsClient";
import { AssignmentRow } from "@/components/contentComponents/assignments/AssignmentsColumn";

const AssignmentsTabContent = ({ data }: { data: AssignmentRow[] }) => {
    return (
        <PaperContainer>
            <AssignmentsClient formattedData={data} />
        </PaperContainer>
    )
}

export default AssignmentsTabContent