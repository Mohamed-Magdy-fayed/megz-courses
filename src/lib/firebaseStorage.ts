import { storage } from "@/config/firebase";
import { ref, getDownloadURL, uploadBytesResumable, StorageReference } from "firebase/storage";

export const upload = async (file: File) => {
    const filename = file.name;
    const storageRef = ref(
        storage,
        `uploads/${filename}`
    );

    const uploadTask = new Promise<StorageReference>((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file);

        task.on('state_changed',
            () => { },
            (error) => {
                reject(error);
            },
            () => {
                resolve(task.snapshot.ref);
            }
        );
    });

    try {
        const snapshotRef = await uploadTask;
        const downloadURL = await getDownloadURL(snapshotRef);
        return downloadURL
    } catch (error) {
        throw new Error(`Error uploading file: ${error}`);
    }
};