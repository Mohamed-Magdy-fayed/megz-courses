import { useEffect, useState } from "react";
import Modal from "../ui/modal";
import { Button } from "../ui/button";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";

interface AssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (assigneeId: string) => void;
    loading: boolean;
}

export const AssignModal = ({
    isOpen,
    loading,
    onClose,
    onConfirm,
}: AssignModalProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [assigneeId, setAssigneeId] = useState("");
    const { data } = api.users.getUsers.useQuery({ userType: "salesAgent" })

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
            <Select
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
                    {data?.users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.email}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="flex w-full items-center justify-end space-x-2 pt-6">
                <Button disabled={loading} variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button disabled={loading} variant="default" onClick={() => onConfirm(assigneeId)}>
                    Continue
                </Button>
            </div>
        </Modal>
    );
};
