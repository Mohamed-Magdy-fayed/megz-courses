import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useState } from "react";
import { PlusSquare } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { LevelRow } from "@/components/contentComponents/levels/LevelColumn";
import LevelClient from "@/components/contentComponents/levels/LevelClient";
import LevelForm from "@/components/contentComponents/levels/LevelForm";

const LevelsTabContent = ({ data, courseSlug }: { data: LevelRow[], courseSlug: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Modal
                title="Create"
                description="Create a new level for the course"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                children={(
                    <LevelForm courseSlug={courseSlug} setIsOpen={setIsOpen} />
                )}
            />
            <div className="p-4 flex gap-4 items-center">
                <Button
                    onClick={() => {
                        setIsOpen(true);
                    }}
                >
                    <PlusSquare className="mr-2"></PlusSquare>
                    Add level
                </Button>
            </div>
            <PaperContainer>
                <LevelClient formattedData={data} />
            </PaperContainer>
        </>
    )
}

export default LevelsTabContent