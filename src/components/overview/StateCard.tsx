import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { formatNumbers, formatPercentage, isGoodState } from '@/lib/utils'
import { Scale, MoveUpRight, MoveDownLeft } from 'lucide-react'
import { Typography } from '../ui/Typoghraphy'
import { Progress } from '../ui/progress'
import { type StateOverview } from './StatesOverview'
import Counter from './Counter'
import { Skeleton } from '../ui/skeleton'

const StateCard = ({ state }: { state: StateOverview | undefined }) => {
    if (!state) return <Skeleton className="col-span-12 rounded-2xlmd:col-span-6 xl:col-span-3 h-48" />

    return (
        <Card className="col-span-12 flex flex-col rounded-2xl bg-white p-2 shadow relative md:col-span-6 xl:col-span-3">
            <CardHeader>
                <Typography variant="secondary" className="!text-xl xl:tracking-tighter xl:!text-lg">
                    {state.title}
                </Typography>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Counter
                    target={state.target}
                    color={state.textColor}
                    currency={state.style === 'currency' ? "EGP" : undefined}
                    label={state.style === "" ? "Students" : undefined}
                    percentage={state.style === "percent"}
                />
                {state.progress && (
                    <Progress
                        indicatorColor="bg-primary"
                        className="bg-accent"
                        value={state.target * 100}
                    >
                    </Progress>
                )}
                {state.totalOrders && (
                    <Typography variant="bodyText" className="text-error">{state.totalOrders} Orders</Typography>
                )}
                <div
                    className={`absolute right-4 top-4 rounded-full p-4 ${state.backgroundColor}`}
                >
                    {state.icon}
                </div>
            </CardContent>
            <CardFooter className="mt-auto">
                {!state.sinceLastWeek ? (
                    <div className="flex gap-2 flex-wrap">
                        <Scale className="text-primary" />
                        <Typography>Not changed</Typography>
                    </div>
                )
                    :
                    isGoodState(state.sinceLastWeek, state.isLiability)
                        ? (
                            <div className="flex gap-2 flex-wrap">
                                {state.sinceLastWeek > 0 && <MoveUpRight className="text-success" />}
                                {state.sinceLastWeek < 0 && <MoveDownLeft className="text-success" />}
                                <Typography className="text-success">{state.progress ? state.sinceLastWeek : formatPercentage(state.sinceLastWeek / state.target * 100)}</Typography>
                                <Typography>Since last week</Typography>
                            </div>
                        )
                        : (
                            <div className="flex gap-2 flex-wrap">
                                {state.sinceLastWeek < 0 && <MoveDownLeft className="text-destructive" />}
                                {state.sinceLastWeek > 0 && <MoveUpRight className="text-destructive" />}
                                <Typography className="text-destructive">{formatPercentage(state.sinceLastWeek / state.target * 100) }</Typography>
                                <Typography>since last week</Typography>
                            </div>
                        )

                }
            </CardFooter>
        </Card>
    )
}

export default StateCard