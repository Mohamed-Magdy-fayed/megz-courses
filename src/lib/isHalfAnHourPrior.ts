export function isHalfAnHourPrior(selectedTime: Date): boolean {
    const now = new Date();
    const halfHourAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Check if the input time is between half an hour ago and now
    return selectedTime >= halfHourAgo && selectedTime <= now;
}
