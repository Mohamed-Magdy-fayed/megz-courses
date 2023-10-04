import { formatPrice } from "@/lib/utils";
import { Typography } from "@mui/material";
import { SalesOperation, SalesAgent, Order, Course, User } from "@prisma/client";
import { PaperContainer } from "../ui/PaperContainers";

const OrderInfoPanel = ({ data }: {
    data: SalesOperation & {
        assignee: (SalesAgent & {
            user: User;
        }) | null;
        orderDetails: (Order & {
            user: User;
            courses: Course[];
        }) | null;
    }
}) => {
    return (
        <PaperContainer className="mt-4 p-4">
            <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div>
                    <div className="flex items-center gap-4">
                        <Typography className="font-bold my-4">Order Number: </Typography>
                        <Typography>{data.orderDetails?.orderNumber || "NA"}</Typography>
                    </div>
                    <Typography>Status: {data.orderDetails?.status || "NA"}</Typography>
                    <Typography>Total: {formatPrice(data.orderDetails?.amount || 0)}</Typography>
                </div>
                <div>
                    <div className="flex items-center gap-4">
                        <Typography className="font-bold my-4">Courses</Typography>
                        <Typography>{data.orderDetails?.courses.length || "NA"}</Typography>
                    </div>
                    {data.orderDetails?.courses.map(course => (
                        <>
                            <Typography>Title: {course.name || "NA"}</Typography>
                            <Typography>Price: {formatPrice(course.price || 0)}</Typography>
                        </>
                    ))}
                </div>
            </div>
        </PaperContainer>
    )
}

export default OrderInfoPanel