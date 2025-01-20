import { useEffect, useState } from "react";
import Modal from "../ui/modal";
import { Button } from "../ui/button";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface AssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (assigneeId: string) => void;
    loading: boolean;
    defaultValue?: string;
}

export const AssignModal = ({
    isOpen,
    loading,
    defaultValue,
    onClose,
    onConfirm,
}: AssignModalProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [assigneeId, setAssigneeId] = useState("");
    const { data } = api.salesAgents.getSalesAgents.useQuery()

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <Modal
            title="Assign Task"
            description="Please select the assignee!"
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="p-4">
                <Select
                    defaultValue={defaultValue}
                    disabled={loading}
                    // @ts-ignore
                    onValueChange={(e) => setAssigneeId(e)}
                >
                    <SelectTrigger className="pl-8">
                        <SelectValue
                            placeholder="Select assignee"
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {data?.salesAgents.map(sa => (
                            <SelectItem key={sa.user.id} value={sa.user.id}>{sa.user.email}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex w-full items-center justify-end space-x-2 pt-6">
                    <Button disabled={loading} variant="outline" customeColor={"mutedOutlined"} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button disabled={loading} variant="default" onClick={() => onConfirm(assigneeId)}>
                        Continue
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
