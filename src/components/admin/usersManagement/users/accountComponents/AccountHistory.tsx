import AccountPaymentClient from '@/components/admin/usersManagement/users/accountComponents/AccountPaymentClient'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/Typoghraphy'
import { Prisma } from '@prisma/client'
import React from 'react'

const AccountHistory = ({ user }: {
    user: Prisma.UserGetPayload<{
        include: {
            orders: true,
        }
    }>
}) => {
    return (
        <Card>
            <CardHeader>
                <div className="space-y-2 flex-col flex">
                    <Typography className="text-left text-xl font-medium">
                        Account history
                    </Typography>
                </div>
            </CardHeader>
            <Separator></Separator>
            <CardContent className="scrollbar-thumb-rounded-lg gap-4 overflow-auto p-4 transition-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50">
                <Typography className="col-span-12" variant={'secondary'}>Payments</Typography>
                <AccountPaymentClient data={user.orders}></AccountPaymentClient>
            </CardContent>
        </Card>
    )
}

export default AccountHistory