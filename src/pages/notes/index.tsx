import AppLayout from "@/components/layout/AppLayout";
import NotesClient from "@/components/notesComponents/NotesClient";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle } from "@/components/ui/Typoghraphy";

export default function NotesPage() {

    return (
        <AppLayout>
            <div className="space-y-2 flex-row flex items-center justify-between">
                <ConceptTitle>
                    Notes
                </ConceptTitle>
            </div>
            <PaperContainer>
                <NotesClient></NotesClient>
            </PaperContainer>
        </AppLayout>
    );
}