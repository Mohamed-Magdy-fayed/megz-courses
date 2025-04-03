import AppLayout from "@/components/pages/adminLayout/AppLayout";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Page() {
    const router = useRouter()
    const code = router.query.code as string
    const state = router.query.state as string

    const { toastError } = useToast()
    const trpcUtils = api.useUtils()
    const createTokenMutation = api.zoomAccounts.createToken.useMutation({
        onSuccess: () => trpcUtils.invalidate().then(() => window.close()),
        onError: ({ message }) => toastError(message),
    })

    useEffect(() => {
        if (!code || !state) return
        createTokenMutation.mutate({ code, state })
    }, [router.query])

    return (
        <AppLayout>
            <Spinner className="mx-auto" />
        </AppLayout>
    );
}