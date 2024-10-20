import { NotesColumn, notesColumns } from "@/components/notesComponents/NotesColumn";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { validNoteStatus, validNoteTypes } from "@/lib/enumsTypes";
import { format } from "date-fns";
import { upperFirst } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const NotesClient = () => {
    const router = useRouter()
    const userId = router.query.id as string | undefined
    const [notes, setNotes] = useState<NotesColumn[]>([])

    const trpcUtils = api.useUtils();
    const { data: notesData, isLoading: isNotesLoading, refetch } = userId ? api.notes.getUserNotes.useQuery({ userId }, {
        enabled: false
    }) : api.notes.getAllNotes.useQuery(undefined, {
        enabled: false
    })
    const deleteMutation = api.notes.deleteNotes.useMutation()

    useEffect(() => {
        refetch()
    }, [])

    const formattedNotesData: NotesColumn[] = notesData?.notes ? notesData.notes.map(note => ({
        id: note.id,
        title: note.title,
        messages: note.messages,
        noteType: note.type,
        status: note.status,
        createdByUserName: note.createdByUser.name,
        createdForStudentName: note.createdForStudent.name,
        createdForStudent: note.createdForStudent,
        createdForMentionsCount: note.mentions.length,
        createdForMentions: note.mentions,
        sla: note.sla.toString(),
        createdAt: note.createdAt,
        updatedAt: format(note.updatedAt, "PPPp"),
    })) : []

    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate({ ids: notes.map(n => n.id) }, {
            onSuccess: () => {
                trpcUtils.invalidate().then(() => callback?.())
            }
        })
    }

    return (
        <DataTable
            skele={isNotesLoading}
            columns={notesColumns}
            data={formattedNotesData}
            setData={setNotes}
            onDelete={onDelete}
            dateRanges={[{ key: "createdAt", label: "Created At" }]}
            searches={[
                { key: "title", label: "Title" },
                { key: "createdForStudentName", label: "Student" },
                { key: "createdForMentionsCount", label: "Mentioned" },
            ]}
            filters={[
                {
                    filterName: "Created By", key: "createdByUserName", values: [...formattedNotesData
                        .map(d => d.createdByUserName)
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(name => ({
                            label: name,
                            value: name,
                        })) || []]
                },
                {
                    filterName: "Type", key: "noteType", values: [...validNoteTypes?.map(type => ({
                        label: upperFirst(type),
                        value: type,
                    })) || []]
                },
                {
                    filterName: "Status", key: "status", values: [...validNoteStatus?.map(status => ({
                        label: upperFirst(status),
                        value: status,
                    })) || []]
                },
            ]}
        />
    );
};

export default NotesClient;
