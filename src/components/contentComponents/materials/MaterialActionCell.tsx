import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Eye, MoreVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useState } from "react";
import { env } from "@/env.mjs";
import Modal from "@/components/ui/modal";
import UploadMaterialForm from "@/components/contentComponents/materials/uploadForm/UploadMaterialForm";
import { MaterialsRow } from "@/components/contentComponents/materials/MaterialsColumn";

const MaterialActionCell: React.FC<MaterialsRow> = ({ courseSlug, slug, subTitle, uploads, createdAt, id, levelSlug, levelName, levelSlugs, materialItemSlug, title, type, updatedAt, sessionOrder }) => {
    const { toastInfo } = useToast();
    const [isOpen, setIsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const onCopy = () => {
        navigator.clipboard.writeText(`${env.NEXT_PUBLIC_NEXTAUTH_URL}content/materials/${materialItemSlug}?path=uploads/content/courses/${courseSlug}/${levelSlug}/${materialItemSlug}`);
        toastInfo("View link copied to the clipboard");
    };

    return (
        <>
            <Modal
                title="Edit"
                description="Edit the material item"
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                children={(
                    <UploadMaterialForm setIsOpen={setIsEditOpen} initialData={{
                        courseSlug,
                        createdAt,
                        id,
                        levelName,
                        levelSlug,
                        levelSlugs,
                        materialItemSlug,
                        title,
                        type,
                        updatedAt,
                        slug,
                        sessionOrder,
                        subTitle,
                        uploads,
                    }} />
                )}
            />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                        setIsEditOpen(true)
                        setIsOpen(false)
                    }}>
                        <Edit className="w-4 h-4 mr-2" />
                        edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy view link
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link target="_blank" href={`/courses/${courseSlug}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default MaterialActionCell;
