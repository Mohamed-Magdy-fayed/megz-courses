import { useEffect, useState } from "react";
import Modal from "../ui/modal";
import { Button } from "../ui/button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (callback?: () => void) => void;
  loading: boolean;
  description?: string;
}

export const AlertModal = ({
  isOpen,
  loading,
  description,
  onClose,
  onConfirm,
}: AlertModalProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Modal
      title="Are you sure?"
      description={description ? description : "This action can't be undone!"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex w-full items-center justify-end space-x-2 pt-6 pb-2">
        <Button disabled={loading} variant={"outline"} customeColor={"mutedOutlined"} onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={loading} customeColor="destructive" onClick={() => onConfirm()}>
          Continue
        </Button>
      </div>
    </Modal>
  );
};
