import Modal from '../../ui/modal'
import { Textarea } from '../../ui/textarea';
import { SpinnerButton } from '../../ui/button';
import { PlusSquareIcon } from 'lucide-react';
import SelectButton from '../../ui/SelectButton';
import { Typography } from '../../ui/Typoghraphy';
import { Label } from '../../ui/label';
import { Separator } from '../../ui/separator';
import { Checkbox } from '../../ui/checkbox';

type AllocationPreview = {
    purchasedLevelsCount: number;
    allocatableLevelsCount: number;
    missingLevelsCount: number;
}

export default function SubmitLevelModal({
    courseName, isOpen, setIsOpen, loading, oralQuestions, oralFeedback, setOralFeedback, level, setLevel, courseLevels, handleSubmitLevel, allocationPreview, isPreviewLoading, confirmPartialAllocation, setConfirmPartialAllocation
}: {
    courseName: string;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void
    oralFeedback: string;
    oralQuestions: string | null;
    setOralFeedback: (val: string) => void
    loading: boolean;
    level: string | undefined;
    setLevel: (val: string) => void;
    courseLevels: { id: string; name: string }[];
    handleSubmitLevel: () => void
    allocationPreview?: AllocationPreview;
    isPreviewLoading?: boolean;
    confirmPartialAllocation?: boolean;
    setConfirmPartialAllocation?: (value: boolean) => void;
}) {
    const hasPartialAllocation = !!allocationPreview && allocationPreview.missingLevelsCount > 0;

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
                {isPreviewLoading && level && (
                    <Typography className="text-muted-foreground">Checking entitlement for selected level...</Typography>
                )}
                {hasPartialAllocation && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
                        <Typography className="text-amber-900">
                            Selected start level can allocate only {allocationPreview.allocatableLevelsCount} out of {allocationPreview.purchasedLevelsCount} purchased levels.
                        </Typography>
                        <Typography className="text-amber-900">
                            {allocationPreview.missingLevelsCount} level(s) will not be allocated because there are no remaining levels after the selected start point.
                        </Typography>
                        <div className="mt-3 flex items-center gap-2">
                            <Checkbox
                                id="confirmPartialAllocation"
                                checked={!!confirmPartialAllocation}
                                onCheckedChange={(value) => setConfirmPartialAllocation?.(!!value)}
                            />
                            <Label htmlFor="confirmPartialAllocation">I understand and want to continue with partial allocation.</Label>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between gap-4">
                    <SelectButton
                        disabled={loading}
                        placeholder="Select Level"
                        listTitle="Level"
                        value={level}
                        setValue={setLevel}
                        data={courseLevels.map(level => ({
                            Active: true,
                            label: level.name,
                            value: level.id,
                        }))}
                    />
                    <SpinnerButton type="button" icon={PlusSquareIcon} isLoading={loading} onClick={handleSubmitLevel} text="Add to Waiting list" />
                </div>
            </div>
        </Modal>
    )
}
