import { columns, NotesColumn } from '@/components/notesComponents/NotesColumn';
import { DataTable } from '@/components/ui/DataTable';
import { api } from '@/lib/api';
import { validNoteStatus, validNoteTypes, validUserTypes } from '@/lib/enumsTypes';
import { format } from 'date-fns';
import { upperFirst } from 'lodash';
import React, { useState } from 'react'

const NotesClient = ({ userId }: { userId?: string }) => {
    const { data: userNotesData } = api.notes.getUserNotes.useQuery({ userId }, { enabled: !!userId })
    const { data: notesData } = api.notes.getAllNotes.useQuery(undefined, { enabled: !userId })

    const [notes, setNotes] = useState<NotesColumn[]>([])

    const formattedData: NotesColumn[] = notesData?.notes ? notesData.notes.map(note => ({
        id: note.id,
        title: note.title,
        messages: note.messages,
        noteType: note.type,
        status: note.status,
        createdByUserName: note.createdByUser.name,
        createdForStudent: note.createdForStudent,
        createdForMentions: note.mentions,
        sla: note.sla.toString(),
        createdAt: format(note.createdAt, "PPPp"),
        updatedAt: format(note.updatedAt, "PPPp"),
    })) : userNotesData?.notes ? userNotesData.notes.map(note => ({
        id: note.id,
        title: note.title,
        messages: note.messages,
        noteType: note.type,
        status: note.status,
        createdByUserName: note.createdByUser.name,
        createdForStudent: note.createdForStudent,
        createdForMentions: note.mentions,
        sla: note.sla.toString(),
        createdAt: format(note.createdAt, "PPPp"),
        updatedAt: format(note.updatedAt, "PPPp"),
    })) : []

    if (!notesData?.notes && !userNotesData?.notes) return <></>

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={setNotes}
            filters={[
                {
                    key: "noteType",
                    filterName: "Note Type",
                    values: [...validNoteTypes.map(type => ({
                        label: upperFirst(type),
                        value: type,
                    }))]
                }, {
                    key: "status",
                    filterName: "Note Status",
                    values: [...validNoteStatus.map(type => ({
                        label: type,
                        value: type,
                    }))]
                }
            ]}
        />
    );
}

export default NotesClient