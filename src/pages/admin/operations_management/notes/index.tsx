import AppLayout from "@/components/pages/adminLayout/AppLayout";
import NotesClient from "@/components/admin/operationsManagement/notesComponents/NotesClient";
import { ConceptTitle } from "@/components/ui/Typoghraphy";

export default function NotesPage() {
    return (
        <AppLayout>
            <div className="space-y-2 flex-row flex items-center justify-between">
                <ConceptTitle>
                    Notes
                </ConceptTitle>
            </div>
            <NotesClient />
        </AppLayout>
    );
}