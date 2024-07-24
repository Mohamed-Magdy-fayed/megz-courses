import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import UploadMaterialForm from "@/components/contentComponents/materials/uploadForm/UploadMaterialForm";
import { MaterialsRow } from "@/components/contentComponents/materials/MaterialsColumn";
import MaterialsClient from "@/components/contentComponents/materials/MaterialsClient";

const MaterialsTabContent = ({ data }: { data: MaterialsRow[] }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* <Modal
                description="Create a material for the course"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Add material"
                children={(
                    <CreateMaterialForm id={data?.course?.id} setIsOpen={setIsOpen} />
                )}
            /> */}
            <Modal
                title="Upload material"
                description="Upload a material for the course"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                children={(
                    <UploadMaterialForm setIsOpen={setIsOpen} />
                )}
            />
            <div className="p-4 flex gap-4 items-center">
                {/* <Button
                    onClick={() => {
                        setIsOpen(true);
                    }}
                >
                    <PlusIcon className="mr-2"></PlusIcon>
                    Add a material
                </Button> */}
                <Button
                    onClick={() => {
                        setIsOpen(true);
                    }}
                >
                    <UploadCloud className="mr-2"></UploadCloud>
                    Upload a material
                </Button>
            </div>
            <PaperContainer>
                <MaterialsClient formattedData={data} />
            </PaperContainer>
        </>
    )
}

export default MaterialsTabContent