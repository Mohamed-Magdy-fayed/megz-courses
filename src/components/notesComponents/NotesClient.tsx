import { columns, NotesColumn } from '@/components/notesComponents/NotesColumn';
import { DataTable } from '@/components/ui/DataTable';
import { api } from '@/lib/api';
import { validNoteTypes } from '@/lib/enumsTypes';
import { format } from 'date-fns';
import { upperFirst } from 'lodash';
import React, { useState } from 'react'

const NotesClient = ({ userId }: { userId?: string }) => {
    const { data: notesData } = api.notes.getUserNotes.useQuery({ userId })

    const [notes, setNotes] = useState<NotesColumn[]>([])

    const formattedData: NotesColumn[] = notesData?.notes ? notesData.notes.map(note => ({
        id: note.id,
        text: note.text,
        noteType: note.type,
        createdByUserName: note.createdByUser.name,
        createdForStudent: note.createdForStudent,
        createdForTypes: note.createdFor,
        createdForMentions: note.mentions,
        sla: note.sla.toString(),
        updateHistory: note.updateHistory,
        createdAt: format(note.createdAt, "PPPp"),
        updatedAt: format(note.updatedAt, "PPPp"),
    })) : []

    if (!notesData?.notes) return <></>

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={setNotes}
            filters={[{
                key: "noteType", filterName: "Note Type", values: [...validNoteTypes.map(type => ({
                    label: upperFirst(type),
                    value: type,
                }))]
            }]}
        />
    );
}

export default NotesClient