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
import { Course, CourseStatus, Order, User } from "@prisma/client";
import CreateOrderModal from "@/components/modals/CreateOrderModal";
import Link from "next/link";

interface CellActionProps {
    id: string;
    coursesData: {
        courses: (Course & {
            orders: (Order & {
                user: User;
            })[];
        })[];
    } | undefined;
    userData: {
        user: User & { courseStatus: CourseStatus[] }
    }
}

const CellAction: React.FC<CellActionProps> = ({ id, coursesData, userData }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false)

    return (
        <>
            {coursesData?.courses && userData?.user
                && (
                    <CreateOrderModal email={userData.user.email} isOpen={isCreateOrderModalOpen} setIsOpen={setIsCreateOrderModalOpen} />
                )
            }
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

export default CellAction;
