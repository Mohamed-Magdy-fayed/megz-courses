import MetaForm from '@/components/systemConfigurations/MetaForm'
import { ApiAlert } from '@/components/ui/api-alert'
import { Button } from '@/components/ui/button'
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy'
import { env } from '@/env.mjs'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { ArrowRightFromLineIcon } from 'lucide-react'
import Link from 'next/link'

export default function MetaConfigTab() {
    const { data: metaClient } = api.metaAccount.getMetaClient.useQuery()
    const { data: currentTier } = api.params.getCurrentTier.useQuery()

    return (
        <div className="space-y-4">
            <ConceptTitle>Sales Channels</ConceptTitle>
            <ApiAlert disabled={!currentTier?.crmFeatures} title="webhook callback url (for Facebook - Instagram - WhatsApp)" description={`${env.NEXT_PUBLIC_NEXTAUTH_URL}api/facebook`} />
            <div className="flex items-center justify-between p-4">
                <Typography>once verified successfully your leads will be added to your database</Typography>
                <Link href={`/leads`} className={cn(!currentTier?.crmFeatures && "pointer-events-none")}>
                    <Button className="whitespace-nowrap space-x-2" disabled={!currentTier?.crmFeatures} customeColor={"primaryOutlined"} variant={"outline"}>
                        <Typography variant={"buttonText"}>Go to Leads</Typography>
                        <ArrowRightFromLineIcon />
                    </Button>
                </Link>
            </div>
            <MetaForm
                disabled={!currentTier?.crmFeatures}
                initialData={metaClient?.metaClient ? {
                    accessToken: metaClient.metaClient.accessToken,
                    fbExchangeToken: "",
                    id: metaClient.metaClient.id,
                    name: metaClient.metaClient.name,
                } : undefined}
            />
        </div>
    )
}
