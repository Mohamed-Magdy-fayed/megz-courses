export function requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log(permission);
            console.log('Notification permission granted.');
        }
    })
}