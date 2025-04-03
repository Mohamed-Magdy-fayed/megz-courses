import { PaperContainer } from "@/components/ui/PaperContainers";
import CourseGroupsClient from "@/components/admin/systemManagement/contentComponents/courseGroups/CourseGroupsClient";
import { CourseRow } from "@/components/admin/systemManagement/contentComponents/courseGroups/CourseGroupsColumn";

const CourseGroupsTabContent = ({ formattedData }: { formattedData: CourseRow[] }) => {

    return (
        <PaperContainer>
            <CourseGroupsClient formattedData={formattedData} />
        </PaperContainer>
    )
}

export default CourseGroupsTabContent