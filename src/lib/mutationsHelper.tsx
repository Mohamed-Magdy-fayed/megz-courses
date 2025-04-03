import Spinner from '@/components/ui/Spinner';
import { ToastFunctionType, toastType } from '@/components/ui/use-toast';
import { AppRouter } from '@/server/api/root';
import { TRPCClientErrorLike } from '@trpc/client';
import { Dispatch, SetStateAction } from 'react';

type ErrorData = TRPCClientErrorLike<AppRouter>;

export function createMutationOptions<TSuccessData, TSuccessVars>(
    { setLoadingToast, successMessageFormatter, toast, trpcUtils, loadingToast, loadingMessage, disableToast }: {
        loadingToast: toastType | undefined,
        setLoadingToast: Dispatch<SetStateAction<toastType | undefined>>,
        trpcUtils: { invalidate: () => Promise<void> };
        toast: ToastFunctionType;
        successMessageFormatter: (data: TSuccessData, variables: TSuccessVars) => string;
        loadingMessage?: string;
        disableToast?: boolean;
    }
) {
    if (disableToast) return {
        onSuccess: (data: TSuccessData, variables: TSuccessVars) => trpcUtils.invalidate(),
        onError: (error: ErrorData) => toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined);
        }
    }
    return {
        onMutate: () => loadingToast ? loadingToast.update({
            id: loadingToast.id,
            title: loadingMessage ?? "Loading...",
            description: <Spinner className="w-4 h-4" />,
            variant: "info",
            duration: 60000,
        }) : setLoadingToast(toast({
            title: loadingMessage ?? "Loading...",
            description: <Spinner className="w-4 h-4" />,
            variant: "info",
            duration: 60000,
        })),
        onSuccess: (data: TSuccessData, variables: TSuccessVars) => trpcUtils.invalidate().then(() => {
            loadingToast?.update({
                id: loadingToast.id,
                title: "Success",
                description: successMessageFormatter(data, variables),
                variant: "success",
            })
        }),
        onError: (error: ErrorData) => loadingToast?.update({
            id: loadingToast.id,
            title: "Error",
            description: error.message,
            variant: "destructive",
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined);
        }
    };
}
