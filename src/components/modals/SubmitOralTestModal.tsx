import Modal from '../ui/modal'
import { Textarea } from '../ui/textarea';
import { SpinnerButton } from '../ui/button';
import { PlusSquareIcon } from 'lucide-react';
import { Typography } from '../ui/Typoghraphy';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

export default function SubmitOralTestModal({
    courseName, isOpen, setIsOpen, loading, oralQuestions, oralFeedback, setOralFeedback, handleSubmit
}: {
    courseName: string;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void
    oralFeedback: string;
    oralQuestions: string | null;
    setOralFeedback: (val: string) => void
    loading: boolean;
    handleSubmit: () => void
}) {
    return (
        <Modal
            title={courseName}
            description="Select the appropriate level for the Student"
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
                <div className="flex items-center justify-between gap-4">
                    <SpinnerButton type="button" icon={PlusSquareIcon} isLoading={loading} onClick={handleSubmit} text="Add to Waiting list" />
                </div>
            </div>
        </Modal>
    )
}
