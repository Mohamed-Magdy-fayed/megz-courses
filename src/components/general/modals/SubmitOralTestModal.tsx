import Modal from '../../ui/modal'
import { Textarea } from '../../ui/textarea';
import { SpinnerButton } from '../../ui/button';
import { PlusSquareIcon } from 'lucide-react';
import { Typography } from '../../ui/Typoghraphy';
import { Label } from '../../ui/label';
import { Separator } from '../../ui/separator';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';

type ProgressionDecision = "MoveNextLevel" | "RepeatLevel" | "CompleteCourse";

export default function SubmitOralTestModal({
    courseName, isOpen, setIsOpen, loading, oralQuestions, oralFeedback, setOralFeedback, handleSubmit, progressionDecision, setProgressionDecision
}: {
    courseName: string;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void
    oralFeedback: string;
    oralQuestions: string | null;
    setOralFeedback: (val: string) => void
    loading: boolean;
    handleSubmit: () => void
    progressionDecision?: ProgressionDecision;
    setProgressionDecision?: (val: ProgressionDecision) => void;
}) {
    const shouldShowProgressionDecision = !!setProgressionDecision;

    return (
        <Modal
            title={courseName}
            description="Write the student final test feedback"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
        >
            <div className="grid gap-4 p-2 pr-4">
                <Typography className="whitespace-pre-wrap">
                    {oralQuestions}
                </Typography>
                <Separator />
                <Label>Feedback</Label>
                <Textarea
                    value={oralFeedback}
                    onChange={(e) => setOralFeedback(e.target.value)}
                    placeholder="Feedback here..."
                    className="w-full p-2 border rounded-md resize-none overflow-auto scrollbar-thin scrollbar-thumb-foreground scrollbar-track-background"
                />
                {shouldShowProgressionDecision && (
                    <>
                        <Label>Progression Decision</Label>
                        <RadioGroup
                            value={progressionDecision}
                            onValueChange={(value) => setProgressionDecision?.(value as ProgressionDecision)}
                            className="grid gap-2"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="MoveNextLevel" id="progression-move-next" />
                                <Label htmlFor="progression-move-next" className="cursor-pointer">Move student to next level waiting list</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="RepeatLevel" id="progression-repeat-level" />
                                <Label htmlFor="progression-repeat-level" className="cursor-pointer">Repeat current level and add to waiting list</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="CompleteCourse" id="progression-complete-course" />
                                <Label htmlFor="progression-complete-course" className="cursor-pointer">Complete course and issue certificate</Label>
                            </div>
                        </RadioGroup>
                    </>
                )}
                <div className="flex items-center justify-between gap-4">
                    <SpinnerButton
                        type="button"
                        icon={PlusSquareIcon}
                        isLoading={loading}
                        onClick={handleSubmit}
                        text={shouldShowProgressionDecision ? "Submit Feedback & Decision" : "Submit Feedback"}
                    />
                </div>
            </div>
        </Modal>
    )
}
