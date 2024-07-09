import { useState, useEffect } from 'react';
import { StorageReference, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { useToast } from '@/components/ui/use-toast';
import { formatPercentage } from '@/lib/utils';

export type UploadStatus = { state: 'Idle' | 'Working', progress: number };

const useFileUpload = () => {
    const [progress, setProgress] = useState(0);
    const [uploadTracker, setUploadTracker] = useState<NodeJS.Timer | null>(null);
    const { toastError, toast } = useToast();

    const uploadFile = async (file: File, path: string): Promise<string | null> => {
        const storageRef = ref(storage, path);

        const uploadToast = toast({
            title: "Uploading...",
            description: "Starting...",
            variant: "info",
            duration: 100000,
        })

        const uploadTask = new Promise<StorageReference>((resolve, reject) => {
            setProgress(0);
            const task = uploadBytesResumable(storageRef, file);

            task.on(
                'state_changed',
                (snapshot) => {
                    const uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    uploadToast.update({
                        id: uploadToast.id, description: formatPercentage(uploadProgress),
                    })
                    setProgress(uploadProgress);
                },
                (error) => reject(error),
                () => resolve(task.snapshot.ref)
            );

            const tracker = setInterval(() => {
                setProgress((task.snapshot.bytesTransferred / task.snapshot.totalBytes) * 100);
            }, 100);

            setUploadTracker(tracker);
        });

        try {
            const snapshotRef = await uploadTask;
            const downloadURL = await getDownloadURL(snapshotRef);
            uploadToast.update({
                id: uploadToast.id,
                title: "Success",
                description: "Upload completed!",
                variant: "success",
                duration: 3000,
            })
            return downloadURL;
        } catch (error) {
            toastError(`${error}`);
            return null;
        } finally {
            if (uploadTracker) {
                clearInterval(uploadTracker);
            }
        }
    };

    useEffect(() => {
        return () => {
            if (uploadTracker) {
                clearInterval(uploadTracker);
            }
        };
    }, [uploadTracker]);

    return {
        progress,
        uploadFile,
    };
};

export default useFileUpload;
