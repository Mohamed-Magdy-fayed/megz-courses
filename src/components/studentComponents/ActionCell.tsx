import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, MoreVertical, PackagePlus } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import CreateOrderForStudent from "./CreateOrderForStudent";
import { Course, CourseStatus, Order, User } from "@prisma/client";

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
    const { toastInfo } = useToast();
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false)

    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toastInfo("ID copied to the clipboard");
    };

    return (
        <>
            {coursesData?.courses && userData?.user
                && (
                    <CreateOrderForStudent
                        coursesData={coursesData.courses}
                        loading={loading}
                        open={isCreateOrderModalOpen}
                        setLoading={setLoading}
                        setOpen={setIsCreateOrderModalOpen}
                        userData={userData.user}
                    />
                )
            }
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
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
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy ID
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default CellAction;
