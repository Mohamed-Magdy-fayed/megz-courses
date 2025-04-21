importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyAuKpE5YU85ZGO1qKo3iUsip7vRC3BpQDI",
    authDomain: "megz-courses.firebaseapp.com",
    projectId: "megz-courses",
    storageBucket: "megz-courses.appspot.com",
    messagingSenderId: "636607862031",
    appId: "1:636607862031:web:0ec8d0f2b0ab6d13795a7a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("Background Message", payload);
    console.log("Data", payload.data);

    const link = payload.data.link;

    const notificationTitle = payload.data.title
    const notificationOptions = {
        body: payload.data.body,
        icon: "/logo.svg",
        data: { url: link },
    }
    self.registration.showNotification(notificationTitle, notificationOptions)
})

self.addEventListener("notificationclick", (event) => {
    console.log("Notification Clicked", event);

    event.notification.close()

    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                const url = event.notification.data.url
                console.log(clientList);

                if (!url) return

                for (const client of clientList) {
                    if (client.url === url && "focus" in client) {
                        return client.focus()
                    }
                }

                if (clients.openWindow) {
                    return clients.openWindow(url)
                }
            })
    )
})
