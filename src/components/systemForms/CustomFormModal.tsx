import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Modal from "@/components/ui/modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomForm from "@/components/systemForms/CustomForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import GoogleFormImporter from "@/components/systemForms/GoogleFormImporter";
import { Prisma } from "@prisma/client";

interface CustomFormModalProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    systemForm?: Prisma.SystemFormGetPayload<{
        include: {
            materialItem: true,
            submissions: true,
            items: { include: { questions: { include: { options: true } } } },
        }
    }>;
}

export const CustomFormModal = ({
    isOpen,
    setIsOpen,
    systemForm,
}: CustomFormModalProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <Modal
            title="Create a Form"
            description="Create Quiz, Assignment, Placement Test, or Final Test Form"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            className="!max-w-[1400px] !w-full"
        >
            <ScrollArea className="h-[70vh]">
                <Tabs>
                    <TabsList defaultValue="custom" id="createFormModal" className="w-full">
                        <TabsTrigger value="custom">Custom</TabsTrigger>
                        <TabsTrigger value="google">Google</TabsTrigger>
                    </TabsList>
                    <TabsContent value="custom">
                        <CustomForm setIsOpen={setIsOpen} initialData={systemForm} />
                    </TabsContent>
                    <TabsContent value="google">
                        <GoogleFormImporter setIsOpen={setIsOpen} initialData={systemForm} />
                    </TabsContent>
                </Tabs>
            </ScrollArea>
        </Modal>
    );
};
