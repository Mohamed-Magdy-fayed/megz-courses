import { useState } from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { useToast } from '@/components/ui/use-toast';
import { formatPercentage } from '@/lib/utils';

export type UploadStatus = { state: 'Idle' | 'Working', progress: number };

const useFileDownload = () => {
    const [progress, setProgress] = useState(0);
    const { toastError, toast } = useToast();

    const downloadFile = async (path: string) => {
        const storageRef = ref(storage, path);

        const downloadToast = toast({
            title: "Downloading...",
            description: "Starting...",
            variant: "info",
            duration: 100000,
        })

        try {
            getDownloadURL(storageRef)
                .then((url) => {
                    const xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';

                    xhr.onprogress = (event) => {
                        const downloadProgress = (event.loaded / event.total) * 100;
                        downloadToast.update({
                            id: downloadToast.id, description: formatPercentage(downloadProgress),
                        })
                        setProgress(downloadProgress);
                    };

                    xhr.onload = () => {
                        const blob = xhr.response;
                        const anchor = document.createElement('a');
                        const objectURL = URL.createObjectURL(blob);
                        anchor.href = objectURL;
                        anchor.download = path.split('/').pop() || 'download';
                        anchor.click();
                        URL.revokeObjectURL(objectURL);
                        downloadToast.update({
                            id: downloadToast.id,
                            title: "Success",
                            description: "Your download is ready!",
                            variant: "success",
                            duration: 3000,
                        })
                        setProgress(0);
                    };

                    xhr.onerror = () => {
                        toastError('Failed to download file');
                        setProgress(0);
                    };

                    xhr.open('GET', url);
                    xhr.send();
                })
                .catch((error => {
                    switch (error.code) {
                        case 'storage/object-not-found':
                            toastError("File doesn't exist")
                            break;
                        case 'storage/unauthorized':
                            toastError("User doesn't have permission to access the object")
                            break;
                        case 'storage/canceled':
                            toastError("User canceled the upload")
                            break;
                        case 'storage/unknown':
                            toastError("Unknown error occurred, inspect the server response")
                            break;
                    }
                }))


        } catch (error) {
            console.log(error);
        }
    };

    return {
        downloadFile,
    };
};

export default useFileDownload;
