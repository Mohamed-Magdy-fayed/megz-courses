import { PaperContainer } from "@/components/ui/PaperContainers";
import QuizzesClient from "@/components/contentComponents/quizzes/QuizzesClient";
import { QuizRow } from "@/components/contentComponents/quizzes/QuizzesColumn";

const QuizzesTabContent = ({ data }: { data: QuizRow[] }) => {
    return (
        <PaperContainer>
            <QuizzesClient formattedData={data} />
        </PaperContainer>
    )
}

export default QuizzesTabContent