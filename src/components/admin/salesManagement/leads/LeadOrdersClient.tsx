import { LeadOrderColumn, leadOrderColumns } from "@/components/admin/salesManagement/leads/LeadOrdersColumns";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { validOrderStatuses } from "@/lib/enumsTypes";
import { upperFirst } from "lodash";

export default function LeadOrdersClient({ leadId }: { leadId: string }) {
    const { data, isLoading } = api.leads.getLeadOrders.useQuery({ leadId })

    const formattedData: LeadOrderColumn[] = data?.orders
        .map(({
            amount,
            course,
            product,
            payments,
            refunds,
            id,
            orderNumber,
            lead,
            status,
            user,
            refundRequester,
            updatedAt,
            createdAt,
        }) => ({
            isStudentView: false,
            id,
            amount,
            paidAmount: payments.reduce((a, b) => a + b.paymentAmount, 0) - refunds.reduce((a, b) => a + b.refundAmount, 0),
            refundedAmount: refunds.reduce((a, b) => a + b.refundAmount, 0),
            remainingAmount: amount - payments.reduce((a, b) => a + b.paymentAmount, 0) + refunds.reduce((a, b) => a + b.refundAmount, 0),
            paidAt: payments[0]?.createdAt,
            orderNumber,
            leadId: lead.id,
            leadCode: lead.code,
            status,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.email,
            refundRequester,
            courseId: course?.id,
            courseSlug: course?.slug,
            courseName: course?.name,
            productName: product?.name,
            productId: product?.id,
            updatedAt,
            createdAt,
        })) ?? []

    return (
        <DataTable
            columns={leadOrderColumns}
            data={formattedData}
            setData={() => { }}
            sum={{ key: "amount", label: "Total" }}
            dateRanges={[{ key: "paidAt", label: "Payment Date" }]}
            searches={[
                { key: "orderNumber", label: "Order Number" },
            ]}
            filters={[
                {
                    key: "status", filterName: "Status", values: [...validOrderStatuses.map(status => ({
                        label: upperFirst(status),
                        value: status,
                    }))]
                },
                {
                    key: "courseId", filterName: "Course", values: [...formattedData.map(d => d.courseId)
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(id => ({
                            label: formattedData.find(d => d.courseId === id)?.courseName || "",
                            value: id || "",
                        }))]
                },
                {
                    key: "productId", filterName: "Product", values: [...formattedData.map(d => d.productId)
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(id => ({
                            label: formattedData.find(d => d.productId === id)?.productName || "",
                            value: id || "",
                        }))]
                },
            ]}
            isLoading={isLoading}
            exportConfig={{ fileName: "Lead Orders", sheetName: "Lead Orders" }}
        />
    )
}
