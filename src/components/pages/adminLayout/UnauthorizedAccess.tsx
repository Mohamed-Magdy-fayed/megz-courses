import Image from "next/image"
import unauthorized_page from '../../../../public/svgs/unauthorized_page.svg'
import { Typography } from "@/components/ui/Typoghraphy"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftToLine } from "lucide-react"

const UnauthorizedAccess = () => {
    return (
        <main className="items-center justify-center flex flex-grow min-h-screen w-screen"  >
            <div>
                <div className="flex flex-col items-center p-8">
                    <div className="text-center mb-4">
                        <Image
                            alt="Under development"
                            src={unauthorized_page}
                            width={400}
                            height={400}
                        />
                    </div>
                    <Typography variant={"primary"} className="mb-4 text-center">
                        401: You're not authorized to view this page
                    </Typography>
                    <Typography className="mb-8" variant="secondary">
                        If you need to gain access please contact your helpdesk
                    </Typography>
                    <Link href="/">
                        <Button>
                            <ArrowLeftToLine />
                            <Typography>Go back home</Typography>
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default UnauthorizedAccess