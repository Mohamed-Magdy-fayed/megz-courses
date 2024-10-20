import Spinner from '@/components/Spinner';
import { ToastFunctionType, toastType } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { AppRouter } from '@/server/api/root';
import { TRPCClientErrorLike } from '@trpc/client';
import { Dispatch, SetStateAction } from 'react';

type ErrorData = TRPCClientErrorLike<AppRouter>;

export function createMutationOptions<TSuccessData>(
    { setLoadingToast, successMessageFormatter, toast, trpcUtils, loadingToast, loadingMessage, disableToast }: {
        loadingToast: toastType | undefined,
        setLoadingToast: Dispatch<SetStateAction<toastType | undefined>>,
        trpcUtils: ReturnType<typeof api.useUtils>;
        toast: ToastFunctionType;
        successMessageFormatter: (data: TSuccessData) => string;
        loadingMessage?: string;
        disableToast?: boolean;
    }
) {
    if (disableToast) return {
        onSuccess: (data: TSuccessData) => trpcUtils.invalidate(),
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
            duration: 30000,
        }) : setLoadingToast(toast({
            title: loadingMessage ?? "Loading...",
            description: <Spinner className="w-4 h-4" />,
            variant: "info",
            duration: 30000,
        })),
        onSuccess: (data: TSuccessData) => trpcUtils.invalidate().then(() => {
            loadingToast?.update({
                id: loadingToast.id,
                title: "Success",
                description: successMessageFormatter(data),
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
