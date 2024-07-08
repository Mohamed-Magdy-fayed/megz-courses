import { storage } from "@/config/firebase";
import { ref, getDownloadURL, uploadBytesResumable, StorageReference, deleteObject, listAll } from "firebase/storage";

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

export const deleteFile = (path: string) => {
    const desertRef = ref(storage, path);

    deleteObject(desertRef)
}

export const deleteFiles = (pathToFolder: string) => {
    const listRef = ref(storage, pathToFolder);

    listAll(listRef)
        .then((res) => {
            res.items.forEach((itemRef) => {
                deleteObject(itemRef)
            });
        })
} 