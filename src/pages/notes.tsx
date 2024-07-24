import AppLayout from "@/components/layout/AppLayout";
import NotesClient from "@/components/notesComponents/NotesClient";
import { Button } from "@/components/ui/button";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { FileDown, FileUp } from "lucide-react";

export default function NotesPage() {
    return (
        <AppLayout>
            <div className="flex flex-col gap-2">
                <ConceptTitle>Notes</ConceptTitle>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={"icon"} customeColor={"infoIcon"}>
                                <FileDown />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <Typography>Import</Typography>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={"icon"} customeColor={"infoIcon"}>
                                <FileUp />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <Typography>Export</Typography>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <PaperContainer>
                <NotesClient></NotesClient>
            </PaperContainer>
        </AppLayout>
    );
}