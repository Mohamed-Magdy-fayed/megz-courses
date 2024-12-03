import { AlertModal } from '@/components/modals/AlertModal'
import Spinner from '@/components/Spinner'
import { Button, SpinnerButton } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Modal from '@/components/ui/modal'
import { PaperContainer } from '@/components/ui/PaperContainers'
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy'
import { toastType, useToast } from '@/components/ui/use-toast'
import WhatsappTemplatesClient from '@/components/whatsAppTemplates/WhatsappTemplatesClient'
import WhatsAppTemplatesForm from '@/components/whatsAppTemplates/WhatsAppTemplatesForm'
import { api } from '@/lib/api'
import { createMutationOptions } from '@/lib/mutationsHelper'
import { TimerResetIcon, PlusSquare, SaveIcon } from 'lucide-react'
import { useState } from 'react'

export default function WhatsappConfigTab() {
    const [isResetOpen, setIsResetOpen] = useState(false)
    const [isTemplatesFormOpen, setIsTemplatesFormOpen] = useState(false)

    const [loadingToast, setLoadingToast] = useState<toastType>();
    const { toast } = useToast()
    const trpcUtils = api.useUtils();
    const resetToDefaultsMutation = api.whatsAppTemplates.resetDefaultTemplates.useMutation(
        createMutationOptions({
            toast,
            setLoadingToast,
            loadingToast,
            trpcUtils,
            successMessageFormatter: ({ createdTemplates }) => `${createdTemplates.createdTemplates.length} Templates Restored`
        })
    )

    return (
        <div className="space-y-4">
            <Modal
                description=""
                title="WhatsApp Template"
                isOpen={isTemplatesFormOpen}
                onClose={() => setIsTemplatesFormOpen(false)}
                children={(
                    <WhatsAppTemplatesForm setIsOpen={setIsTemplatesFormOpen} />
                )}
            />
            <div className="flex items-center justify-between gap-4">
                <ConceptTitle>WhatsApp</ConceptTitle>
                <div className="flex items-center justify-end gap-4">
                    <AlertModal
                        loading={!!loadingToast}
                        onConfirm={() => (resetToDefaultsMutation.mutate(), setIsResetOpen(false))}
                        description="Caution, restoring defaults will overwrite any customizations you have done!"
                        isOpen={isResetOpen}
                        onClose={() => setIsResetOpen(false)}
                    />
                    <SpinnerButton
                        customeColor="destructiveIcon"
                        text="Restore Defaults"
                        icon={TimerResetIcon}
                        isLoading={!!loadingToast}
                        onClick={() => setIsResetOpen(true)}
                    />
                    <Button onClick={() => setIsTemplatesFormOpen(true)} >
                        Create a Template <PlusSquare className="size-4" />
                    </Button>
                </div>
            </div>
            <PaperContainer>
                <Typography variant="secondary">Templates List</Typography>
                <WhatsappTemplatesClient />
            </PaperContainer>
        </div>
    )
}
