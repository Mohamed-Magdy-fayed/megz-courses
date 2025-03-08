import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EyeIcon, ChevronDownIcon, PackagePlus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import CreateOrderModal from "@/components/admin/salesManagement/modals/CreateOrderModal";
import { StudentColumns } from "@/components/admin/usersManagement/students/StudentColumn";

const StudentActions: React.FC<StudentColumns> = ({ id, name }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false)

    return (
        <>
            <CreateOrderModal isOpen={isCreateOrderModalOpen} setIsOpen={setIsCreateOrderModalOpen} userExists={{ studentId: id, studentName: name }} />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                        setIsCreateOrderModalOpen(true)
                        setIsOpen(false)
                    }}>
                        <PackagePlus className="w-4 h-4 mr-2" />
                        Create Order
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/users_management/account/${id}`}>
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default StudentActions;
