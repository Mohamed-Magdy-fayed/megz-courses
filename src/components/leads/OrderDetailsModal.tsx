import { Dispatch, SetStateAction } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/Typoghraphy"
import Modal from "@/components/ui/modal"
import Link from "next/link"
import { Copy, CopyPlus, Link2 } from "lucide-react"
import WrapWithTooltip from "../ui/wrap-with-tooltip"
import { CreatedUserData } from "./CreateQuickOrderModal"

const OrderDetailsModal = ({ isOpen, setIsOpen, userDetails }: {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    userDetails: CreatedUserData;
}) => {
    const { toastSuccess } = useToast()

    return (
        <Modal
            title={"User Details"}
            description={"Do you want to process the lead?"}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            children={<div className="flex flex-col gap-4 p-2">
                <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex flex-col gap-2">
                        <Typography>Email</Typography>
                        <Typography>Password</Typography>
                    </div>
                    <div
                        onDoubleClick={() => {
                            navigator.clipboard.writeText(`${userDetails.email}\n${userDetails.password}`);
                            toastSuccess("Credentials copied to the clipboard");
                        }}
                        className="flex flex-col gap-2 bg-primary/10 border border-primary rounded-lg p-2"
                    >
                        <Typography>{userDetails.email}</Typography>
                        <Typography>{userDetails.password}</Typography>
                    </div>
                    <WrapWithTooltip text={"Copy user credentials"}>
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(`${userDetails.email}\n${userDetails.password}`);
                                toastSuccess("Credentials copied to the clipboard");
                            }}
                            customeColor={"infoIcon"}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </WrapWithTooltip>
                </div>
                <Typography>You can send the written test link to the Student</Typography>
                <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex flex-col gap-2">
                        <WrapWithTooltip text={userDetails.writtenTestUrl}>
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(userDetails.writtenTestUrl);
                                    toastSuccess("Link copied to the clipboard");
                                }}
                                customeColor={"infoIcon"}
                            >
                                <Typography>Click to copy the Link</Typography>
                                <CopyPlus className="w-4 h-4" />
                            </Button>
                        </WrapWithTooltip>
                        <Link href={`/leads/${userDetails.leadCode}`}>
                            <Button customeColor={"success"}>
                                <Typography>Go to lead</Typography>
                                <Link2 className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            }
        />
    )
}

export default OrderDetailsModal