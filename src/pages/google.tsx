import AppLayout from "@/components/layout/AppLayout";
import Spinner from "@/components/Spinner";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Page() {
    const router = useRouter()
    const code = router.query.code as string
    const scope = router.query.scope as string
    const name = router.query.state as string

    const [loading, setLoading] = useState(true)
    const { toastError } = useToast()

    const createTokenMutation = api.googleAccounts.createToken.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: () => window.close(),
        onError: ({ message }) => toastError(message),
        onSettled: () => setLoading(false),
    })

    useEffect(() => {
        if (!scope || !code) return
        createTokenMutation.mutate({ code, name })
    }, [router.query])

    if (loading) return (
        <AppLayout>
            <Spinner className="mx-auto" />
        </AppLayout>
    );
    return (
        <AppLayout>
            An error occured, Please try again
        </AppLayout>
    );
}