import AssignmentsClient from "@/components/admin/systemManagement/contentComponents/assignments/AssignmentsClient";
import { AssignmentRow } from "@/components/admin/systemManagement/contentComponents/assignments/AssignmentsColumn";
import { PaperContainer } from "@/components/ui/PaperContainers";

const AssignmentsTabContent = ({ data }: { data: AssignmentRow[] }) => {
    return (
        <PaperContainer>
            <AssignmentsClient formattedData={data} />
        </PaperContainer>
    )
}

export default AssignmentsTabContent