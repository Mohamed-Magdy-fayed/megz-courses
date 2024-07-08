import { useState, useEffect } from 'react';
import { StorageReference, getDownloadURL, ref, uploadBytesResumable, } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { useToast } from '@/components/ui/use-toast';

export type UploadStatus = { state: 'Idle' | 'Working', progress: number };

const useFileDownload = () => {
    const [progress, setProgress] = useState(0);
    const { toastError } = useToast();

    const downloadFile = async (path: string) => {
        const starsRef = ref(storage, path);

        try {
            getDownloadURL(starsRef)
                .then((url) => {
                    const xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';

                    xhr.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const downloadProgress = (event.loaded / event.total) * 100;
                            setProgress(downloadProgress);
                        }
                    };

                    xhr.onload = () => {
                        const blob = xhr.response;
                        const anchor = document.createElement('a');
                        const objectURL = URL.createObjectURL(blob);
                        anchor.href = objectURL;
                        anchor.download = path.split('/').pop() || 'download';
                        anchor.click();
                        URL.revokeObjectURL(objectURL);
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

        }
    };

    return {
        progress,
        downloadFile,
    };
};

export default useFileDownload;
