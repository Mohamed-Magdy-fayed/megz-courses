import AppLayout from "@/layouts/AppLayout";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const OperationPage: NextPage = () => {
    const operationId = useRouter().query.OperationId

    return (
        <AppLayout>
            {operationId}
        </AppLayout>
    )
}

export default OperationPage