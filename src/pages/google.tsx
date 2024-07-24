import AppLayout from "@/components/layout/AppLayout";
import Spinner from "@/components/Spinner";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Page() {
    const router = useRouter()
    const code = router.query.code as string
    const scope = router.query.scope as string

    const createTokenMutation = api.googleAccounts.createToken.useMutation({
        onSuccess: () => window.close(),
        onError: ({ message }) => console.log(message),
    })

    useEffect(() => {
        if (!scope || !code) return
        createTokenMutation.mutate({ code })
    }, [router.query])

    return (
        <AppLayout>
            <Spinner></Spinner>
        </AppLayout>
    );
}