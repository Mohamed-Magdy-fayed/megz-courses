import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, Download, FileText, ListChecks, ListTodo, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MaterialColumn } from "@/components/student/myCoursesComponents/level-components/materials-columns";
import useFileDownload from "@/hooks/useFileDownload";

export default function MaterialActions({ material }: { material: MaterialColumn }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { downloadFile } = useFileDownload();

    // Drip logic: Only allow access if session is available/unlocked
    const canAccessQuiz = !["Cancelled", "Scheduled"].includes(material.sessionStatus);
    const canAccessSession = ["Ongoing", "Completed"].includes(material.sessionStatus);
    const canAccessAssignment = material.sessionStatus === "Completed";

    // Batch download handler
    const handleBatchDownload = async () => {
        if (material.contentLinks && material.contentLinks.length > 0) {
            for (const path of material.contentLinks) {
                await downloadFile(path);
            }
        }
    };

    return (
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
                <Button customeColor="mutedOutlined" variant="outline" className="w-full h-fit p-0">
                    <ChevronDownIcon className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {material.quizLink && (
                    <DropdownMenuItem disabled={!canAccessQuiz} asChild>
                        <Link href={material.quizLink}>
                            <ListChecks className="w-4 h-4 mr-2" />
                            Quiz
                        </Link>
                    </DropdownMenuItem>
                )}
                {material.sessionLink && (
                    <DropdownMenuItem disabled={!canAccessSession} asChild>
                        <Link href={material.sessionLink}>
                            <FileText className="w-4 h-4 mr-2" />
                            Session
                        </Link>
                    </DropdownMenuItem>
                )}
                {material.assignmentLink && (
                    <DropdownMenuItem disabled={!canAccessAssignment} asChild>
                        <Link href={material.assignmentLink}>
                            <ListTodo className="w-4 h-4 mr-2" />
                            Assignment
                        </Link>
                    </DropdownMenuItem>
                )}
                {material.contentLinks && material.contentLinks.length > 0 && (
                    <DropdownMenuItem disabled={!canAccessAssignment} onClick={handleBatchDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download All Content
                    </DropdownMenuItem>
                )}
                {material.finalTestLink && (
                    <DropdownMenuItem asChild disabled={material.finalTestSubmitted}>
                        <Link href={material.finalTestLink}>
                            <Trophy className="w-4 h-4 mr-2" />
                            Final Test
                        </Link>
                    </DropdownMenuItem>
                )}
                {material.certificateUrl && (
                    <DropdownMenuItem asChild>
                        <Link href={material.certificateUrl} target="_blank">
                            <Trophy className="w-4 h-4 mr-2" />
                            Certificate
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}