import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Typography } from '@/components/ui/Typoghraphy'
import AccountPaymentClient from '@/components/users/accountComponents/AccountPaymentClient'
import { Order, User } from '@prisma/client'
import { Separator } from '@radix-ui/react-select'
import React from 'react'

const AccountHistory = ({ user }: {
    user: (User & {
        orders: Order[];
    });
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