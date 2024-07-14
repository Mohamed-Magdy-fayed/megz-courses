import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import ZoomAccountForm from "@/components/zoomAccount/ZoomAccountForm";
import ZoomAccountsClient from "@/components/zoomAccount/ZoomAccountsClient";
import { PlusSquare } from "lucide-react";
import { useState } from "react";

export default function Page() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <AppLayout>
            <Modal
                description=""
                title="Add a zoom account"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                children={(
                    <ZoomAccountForm setIsOpen={setIsOpen} />
                )}
            />
            <div className="space-y-4">
                <div className="flex items-center justify-between w-full">
                    <ConceptTitle>Zoom Accounts</ConceptTitle>
                    <Button onClick={() => setIsOpen(true)} >
                        <PlusSquare className="w-4 h-4 mr-2" />
                        Add an account
                    </Button>
                </div>
                <PaperContainer>
                    <ZoomAccountsClient />
                </PaperContainer>
            </div>
        </AppLayout>
    );
}