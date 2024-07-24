import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, CopyPlus, Edit, Eye, MoreVertical } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "@/lib/api";
import Spinner from "@/components/Spinner";
import { useState } from "react";
import { env } from "@/env.mjs";
import Modal from "@/components/ui/modal";
import UploadMaterialForm from "@/components/contentComponents/materials/uploadForm/UploadMaterialForm";
import { MaterialsRow } from "@/components/contentComponents/materials/MaterialsColumn";

const MaterialActionCell: React.FC<MaterialsRow> = ({ courseSlug, slug, subTitle, uploads, createdAt, id, levelSlug, levelName, levelSlugs, materialItemSlug, title, type, updatedAt }) => {
    const { toastInfo, toast } = useToast();
    const [toastData, setToastData] = useState<toastType>()
    const [isOpen, setIsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const onCopy = () => {
        navigator.clipboard.writeText(`${env.NEXT_PUBLIC_NEXTAUTH_URL}content/materials/${materialItemSlug}?path=uploads/content/courses/${courseSlug}/${levelSlug}/${materialItemSlug}`);
        toastInfo("View link copied to the clipboard");
    };

    const trpcUtils = api.useContext()
    const dublicateMutation = api.materials.dublicateMaterialItem.useMutation({
        onMutate: () => {
            const toastData = toast({ title: "Loading...", description: <Spinner className="w-4 h-4" />, duration: 30000, variant: "info" })
            setToastData(toastData)
        },
        onSuccess: ({ materialItemDublication }) => trpcUtils.courses.invalidate().then(() => toastData?.update({
            id: toastData.id,
            title: "Success",
            variant: "success",
            description: `Material item ${materialItemDublication.title} dublicated successfully`,
        })),
        onError: ({ message }) => toastData?.update({
            id: toastData.id,
            title: "Error",
            variant: "destructive",
            description: message,
        }),
        onSettled: () => toastData?.update({
            id: toastData.id,
            duration: 3000,
        }),
    })
    const handleDublicate = () => {
        dublicateMutation.mutate({ id })
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
                    <DropdownMenuItem onClick={handleDublicate}>
                        <CopyPlus className="w-4 h-4 mr-2" />
                        Dublicate
                    </DropdownMenuItem>
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
