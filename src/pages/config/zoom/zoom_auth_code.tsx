import AppLayout from "@/components/layout/AppLayout";
import Spinner from "@/components/Spinner";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Page() {
    const router = useRouter()
    const code = router.query.code as string
    const state = router.query.state as string

    const { toastError } = useToast()
    const trpcUtils = api.useContext()
    const createTokenMutation = api.zoomAccounts.createToken.useMutation({
        onSuccess: () => trpcUtils.invalidate(),
        onError: ({ message }) => toastError(message),
        onSettled: () => {},
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