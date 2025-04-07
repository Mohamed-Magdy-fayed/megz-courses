import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/Typoghraphy'

export default function OrderSummary({ discountAmount, discountPercentage, discountedPrice, price }: {
    price: string;
    discountPercentage: string;
    discountAmount: string;
    discountedPrice: string;
}) {
    return (
        <div className="grid grid-cols-2 text-start w-full gap-x-4 gap-y-2 items-start">
            <Typography className="col-span-2" variant="secondary">Order Summary</Typography>
            <Separator className="col-span-2" />
            <Typography>Price:</Typography>
            <Typography>{price}</Typography>
            {discountPercentage !== "0" && (
                <>
                    <Typography>Discounts ({discountPercentage} Off):</Typography>
                    <Typography>-{discountAmount}</Typography>
                </>
            )}
            <Separator className="col-span-2" />
            <Typography>Total: </Typography>
            <Typography>{discountedPrice}</Typography>
        </div>
    )
}
