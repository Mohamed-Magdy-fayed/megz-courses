import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/Typoghraphy'

export default function OrderSummary({ price }: {
    price: string;
}) {
    return (
        <div className="grid grid-cols-2 text-start w-full gap-x-4 gap-y-2 items-start">
            <Typography className="col-span-2" variant="secondary">Order Summary</Typography>
            <Separator className="col-span-2" />
            <Typography>Price:</Typography>
            <Typography>{price}</Typography>
            <Separator className="col-span-2" />
            <Typography>Total: </Typography>
            <Typography>{price}</Typography>
        </div>
    )
}
