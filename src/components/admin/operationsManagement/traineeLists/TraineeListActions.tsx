import { TraineeList } from "@/components/admin/operationsManagement/traineeLists/TraineeListColumn";
import CreateOrderModal from "@/components/admin/salesManagement/modals/CreateOrderModal";
import ProductForm from "@/components/admin/systemManagement/products/ProductForm";
import { AlertModal } from "@/components/modals/AlertModal";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Modal from "@/components/ui/modal";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { ChevronDownIcon, Edit, Trash } from "lucide-react";
import { useState } from "react";

export default function TraineeListActions(product: TraineeList) {
    const { toast } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const trpcUtils = api.useUtils()
    const deleteMutation = api.products.delete.useMutation(
        createMutationOptions({
            trpcUtils: trpcUtils.products,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ products }) => {
                return `${products.count} products deleted`
            },
            loadingMessage: "Deleting...",
        })
    )

    const onDelete = () => {
        deleteMutation.mutate([product.id])
    };

    return (
        <>
            <AlertModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                loading={!!loadingToast}
                onConfirm={onDelete}
            />
            <DropdownMenu open={isMenuOpen} onOpenChange={(val) => setIsMenuOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                        // setIsEditOpen(true)
                        setIsMenuOpen(false)
                    }}>
                        <Edit className="w-4 h-4 mr-2" />
                        edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsDeleteOpen(true)
                        setIsMenuOpen(false)
                    }}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
