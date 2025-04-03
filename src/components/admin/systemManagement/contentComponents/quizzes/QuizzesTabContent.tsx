import { PaperContainer } from "@/components/ui/PaperContainers";
import QuizzesClient from "@/components/admin/systemManagement/contentComponents/quizzes/QuizzesClient";
import { QuizRow } from "@/components/admin/systemManagement/contentComponents/quizzes/QuizzesColumn";

const QuizzesTabContent = ({ data }: { data: QuizRow[] }) => {
    return (
        <PaperContainer>
            <QuizzesClient formattedData={data} />
        </PaperContainer>
    )
}

export default QuizzesTabContent