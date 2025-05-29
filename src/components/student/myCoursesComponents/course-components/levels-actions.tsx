import ProductForm from "@/components/admin/systemManagement/products/ProductForm";
import { AlertModal } from "@/components/general/modals/AlertModal";
import { LevelColumn } from "@/components/student/myCoursesComponents/course-components/levels-columns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Modal from "@/components/ui/modal";
import { SeverityPill } from "@/components/ui/SeverityPill";
import { toastType, useToast } from "@/components/ui/use-toast";
import { MessagesSquareIcon, TrophyIcon } from "lucide-react";
import { ChevronDownIcon, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LevelActions(level: LevelColumn) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <DropdownMenu open={isMenuOpen} onOpenChange={(val) => setIsMenuOpen(val)}>
            <DropdownMenuTrigger asChild>
                <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                    <ChevronDownIcon className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link href={`/student/discussions/${level.groupId}`}>
                        <MessagesSquareIcon className="w-4 h-4 mr-2" />
                        Group Discussion
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild disabled={!!level.finalTestScore || level.groupStatus !== "Completed"}>
                    <Link href={`/student/my_courses/${level.courseSlug}/${level.levelSlug}/final_test`}>
                        <TrophyIcon className="w-4 h-4 mr-2" />
                        Final Test
                        {!!level.finalTestScore && <SeverityPill color="success" children={"Done"} />}
                    </Link>
                </DropdownMenuItem>
                {level.certificateUrl && (
                    <DropdownMenuItem asChild>
                        <Link href={level.certificateUrl} target="_blank">
                            <TrophyIcon className="w-4 h-4 mr-2" />
                            Certificate
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
