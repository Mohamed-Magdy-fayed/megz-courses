import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, CopyPlus, Edit, Eye, MoreVertical } from "lucide-react";
import { ToasterToast, useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "@/lib/api";
import Spinner from "@/components/Spinner";
import { useState } from "react";

interface CellActionProps {
    id: string;
    courseId: string;
}

const MaterialActionCell: React.FC<CellActionProps> = ({ id, courseId }) => {
    const { toastInfo, toast } = useToast();
    const router = useRouter()
    const [toastData, setToastData] = useState<{
        id: string;
        dismiss: () => void;
        update: (props: ToasterToast) => void;
    }>()

    const onCopy = () => {
        navigator.clipboard.writeText(`${window.location.host}/courses/${courseId}`);
        toastInfo("User link copied to the clipboard");
    };

    const trpcUtils = api.useContext()
    const dublicateMutation = api.materials.dublicateMaterialItem.useMutation({
        onMutate: () => {
            const toastData = toast({ title: "Loading...", description: <Spinner className="w-4 h-4" />, duration: 30000, variant: "info" })
            setToastData(toastData)
        },
        onSuccess: ({ materialItemDublication }) => trpcUtils.materials.invalidate().then(() => toastData?.update({
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
            <DropdownMenu>
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
                    <DropdownMenuItem onClick={() => router.push(`/content/materials/${id}`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy view link
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link target="_blank" href={`/courses/${courseId}`}>
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
