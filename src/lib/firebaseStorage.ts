import { storage } from "@/config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadFile = async (file: File) => {
    try {
        const filename = file.name;
        const storageRef = ref(
            storage,
            `uploads/${filename}}`
        );
        const res = await uploadBytes(storageRef, file);

        return res.metadata.fullPath;
    } catch (error) {
        throw error;
    }
};

export const getFile = async (path: string) => {
    try {
        const fileRef = ref(storage, path);
        return getDownloadURL(fileRef);
    } catch (error) {
        throw error;
    }
};