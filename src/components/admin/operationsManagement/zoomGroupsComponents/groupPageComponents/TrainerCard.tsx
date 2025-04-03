import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/Typoghraphy"
import { getInitials } from "@/lib/getInitials"
import { MessageSquare } from "lucide-react"
import Link from "next/link"

export default function TrainerCard({ trainerUser }: {
    trainerUser: {
        name: string;
        email: string;
        image: string | null;
        id: string;
        phone: string;
    }
}) {
    return (
        <Card className="flex flex-col gap-2 w-full">
            <CardHeader>
                <CardTitle>Trainer</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="truncate flex flex-col">
                <div className="flex items-center justify-between">
                    <Avatar className="w-16 h-16">
                        <AvatarImage alt={getInitials(trainerUser.name)} src={trainerUser.image || ""} />
                        <AvatarFallback>{getInitials(trainerUser.name)}</AvatarFallback>
                    </Avatar>
                    <Link href={`https://wa.me/${trainerUser.phone}`} target="_blank">
                        <Button variant={"icon"} customeColor={"successIcon"}>
                            <MessageSquare></MessageSquare>
                        </Button>
                    </Link>
                </div>
                <Typography>{trainerUser.name}</Typography>
                <Link className="in-table-link" href={`/admin/users_management/account/${trainerUser.id}`}>
                    <Typography>{trainerUser.email}</Typography>
                </Link>
                <Typography>Phone: {trainerUser.phone}</Typography>
            </CardContent>
        </Card>
    )
}
