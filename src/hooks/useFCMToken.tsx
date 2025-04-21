import { useEffect, useRef, useState } from "react";
import { Unsubscribe, onMessage } from "firebase/messaging";
import { fetchToken, messaging } from "@/config/firebase";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";

async function getNotificationPermissionAndToken() {
    if (!("Notification" in window)) {
        return null
    }

    if (Notification.permission === "granted") {
        return await fetchToken()
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission()
        if (permission === "granted") {
            return await fetchToken()
        }
    }

    return null
}

export const useFCMToken = () => {
    const { status } = useSession()
    const { toast } = useToast()
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const retryCount = useRef(0)
    const isLoading = useRef(false)

    const saveTokenMutation = api.pushNotifications.saveToken.useMutation()
    const removeTokenMutation = api.pushNotifications.removeToken.useMutation()

    const loadToken = async () => {
        if (isLoading.current) return

        isLoading.current = true

        const token = await getNotificationPermissionAndToken()
        if (Notification.permission === "denied") {
            setNotificationPermissionStatus("denied")
            await removeTokenMutation.mutateAsync()
            isLoading.current = false
            return
        }

        if (!token) {
            if (retryCount.current >= 3) {
                alert("Unable to load token, please refresh the browser!")
                isLoading.current = false
                return
            }

            retryCount.current += 1
            isLoading.current = false
            await loadToken()
            return
        }

        setNotificationPermissionStatus(Notification.permission)
        setToken(token)
        await saveTokenMutation.mutateAsync({ token })
        isLoading.current = false
    }

    useEffect(() => {
        if ("Notification" in window && status === "authenticated") {
            loadToken()
        }
    }, [status])

    useEffect(() => {
        const setupListener = async () => {
            if (!token) return

            const m = await messaging()
            if (!m) return

            const unsubscribe = onMessage(m, (payload) => {
                if (Notification.permission !== "granted") return

                const link = payload.data?.link

                if (link) {
                    toast({
                        title: payload.data?.title,
                        description: payload.data?.body,
                        variant: "info",
                        action: <Link href={link} children={"View"} />
                    })
                } else {
                    toast({
                        title: payload.data?.title,
                        description: payload.data?.body,
                        variant: "info",
                    })
                }
            })

            return unsubscribe
        }

        let unsubscribe: Unsubscribe | null = null

        setupListener().then(unsub => {
            if (unsub) {
                unsubscribe = unsub
            }
        })

        return () => unsubscribe?.()
    }, [token])

    return { notificationPermissionStatus, token }
}
