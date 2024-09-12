import NotesClient from '@/components/notesComponents/NotesClient'
import { NotesForm } from '@/components/notesComponents/NotesForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Modal from '@/components/ui/modal'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/Typoghraphy'
import { BookmarkPlus } from 'lucide-react'
import { useState } from 'react'

const AccountNotes = () => {
    const [isAddNoteopen, setIsAddNoteOpen] = useState(false)

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
                <NotesClient />
            </CardContent>
        </Card>
    )
}

export default AccountNotes