import GenericClient from '@/components/GenericClient'
import { NotesColumn, notesColumns } from '@/components/notesComponents/NotesColumn'
import { NotesForm } from '@/components/notesComponents/NotesForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Modal from '@/components/ui/modal'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/Typoghraphy'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { BookmarkPlus } from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const AccountNotes = () => {
    const [isAddNoteopen, setIsAddNoteOpen] = useState(false)
    const router = useRouter()
    const userId = router.query.id as string

    const { data: notesData, refetch: refetchNotes, isLoading: isNotesLoading } = api.notes.getAllNotes.useQuery(undefined, { enabled: false })

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

    useEffect(() => {
        refetchNotes()
    }, [])

    return (
        <Card>
            <Modal
                title="Add"
                description="Add a note to the user account"
                isOpen={isAddNoteopen}
                onClose={() => setIsAddNoteOpen(false)}
                children={(
                    <div>
                        <NotesForm setIsOpen={setIsAddNoteOpen} />
                    </div>
                )}
            />
            <CardHeader>
                <div className="space-y-2 flex-row flex items-center justify-between">
                    <Typography className="text-left text-xl font-medium">
                        Account Notes
                    </Typography>
                    <Button onClick={() => setIsAddNoteOpen(true)}>
                        <BookmarkPlus className="w-4 h-4" />
                        <Typography>Add</Typography>
                    </Button>
                </div>
            </CardHeader>
            <Separator></Separator>
            <CardContent className="scrollbar-thumb-rounded-lg gap-4 overflow-auto p-4 transition-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50">
                <Typography className="col-span-12" variant={'secondary'}>Notes</Typography>
                {isNotesLoading
                    ? <GenericClient columns={notesColumns} />
                    : <GenericClient columns={notesColumns} formattedData={formattedNotesData} />}
            </CardContent>
        </Card>
    )
}

export default AccountNotes