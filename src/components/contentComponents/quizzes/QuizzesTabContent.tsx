import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useState } from "react";
import { PlusSquare } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import ConnectGoogleForm from "@/components/FormsComponents/ConnectGoogleForm";
import { Typography } from "@/components/ui/Typoghraphy";
import CustomForm from "@/components/FormsComponents/CustomForm";
import QuizzesClient from "@/components/contentComponents/quizzes/QuizzesClient";
import { QuizRow } from "@/components/contentComponents/quizzes/QuizzesColumn";

const QuizzesTabContent = ({ data }: { data: QuizRow[] }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isGoogleOpen, setIsGoogleOpen] = useState(false)

    return (
        <>
            <Modal
                title="Create"
                description="Create Quiz or Assignment"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                children={(
                    <CustomForm setIsOpen={setIsOpen} />
                )}
            />
            <Modal
                title="Connect Google Form"
                description="Use a google form as an assignment or quiz"
                isOpen={isGoogleOpen}
                onClose={() => setIsGoogleOpen(false)}
                children={(
                    <ConnectGoogleForm setIsOpen={setIsGoogleOpen} />
                )}
            />
            <div className="p-4 space-x-4">
                <Button onClick={() => setIsOpen(true)}>
                    <PlusSquare />
                    <Typography>Add Quiz</Typography>
                </Button>
                <Button onClick={() => setIsGoogleOpen(true)}>
                    <PlusSquare />
                    <Typography>Add Google Form</Typography>
                </Button>
            </div>
            <PaperContainer>
                <QuizzesClient formattedData={data} />
            </PaperContainer>
        </>
    )
}

export default QuizzesTabContent