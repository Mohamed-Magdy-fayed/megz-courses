import { useState, useEffect } from 'react';
import { StorageReference, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { useToast } from '@/components/ui/use-toast';
import { formatPercentage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckSquare, XSquareIcon } from 'lucide-react';

export type UploadStatus = { state: 'Idle' | 'Working', progress: number };

const useFileUpload = () => {
    const [progress, setProgress] = useState(0);
    const [uploadTracker, setUploadTracker] = useState<NodeJS.Timer | null>(null);
    const { toastError, toast } = useToast();

    const uploadFile = async (file: File, path: string, index: number, length: number) => {
        let storageRef = ref(storage, path);

        const uploadToast = toast({
            title: `Uploading... ${length > 1 ? `${index + 1} of ${length} files` : `1 file`}`,
            description: "Starting...",
            variant: "info",
            duration: 100000,
        })

        const uploadTask = new Promise<StorageReference>((resolve, reject) => {
            setProgress(0);
            const task = uploadBytesResumable(storageRef, file);
            task.pause()

            getDownloadURL(storageRef).then(url => {
                if (url) {
                    uploadToast.update({
                        id: uploadToast.id,
                        title: "Dublicate file name",
                        description: `file with same name ${file.name} already exists, do you want to overwrite it?`,
                        variant: "default",
                        duration: 2000,
                        action: (
                            <div className='flex flex-col items-center gap-2'>
                                <Button
                                    variant={"icon"}
                                    customeColor={"successIcon"}
                                    onClick={() => {
                                        task.resume();
                                    }}
                                >
                                    <CheckSquare />
                                </Button>
                                <Button
                                    variant={"icon"}
                                    customeColor={"destructiveIcon"}
                                    onClick={() => {
                                        task.cancel();
                                        setProgress(0)
                                        uploadToast.update({
                                            id: uploadToast.id,
                                            title: "Cancelled",
                                            description: "Upload has been cancelled!",
                                            variant: "destructive",
                                            duration: 2000,
                                            action: undefined,
                                        });
                                    }}
                                >
                                    <XSquareIcon />
                                </Button>
                            </div>
                        )
                    })
                }
            }).catch(() => {
                task.resume()
            })

            task.on(
                'state_changed',
                (snapshot) => {
                    const uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    uploadToast.update({
                        id: uploadToast.id, description: formatPercentage(uploadProgress), variant: "info",
                        action: <Button
                            variant={"icon"}
                            customeColor={"destructiveIcon"}
                            onClick={() => {
                                task.cancel();
                                if (uploadTracker) {
                                    clearInterval(uploadTracker);
                                }
                                setProgress(0)
                                uploadToast.update({
                                    id: uploadToast.id,
                                    title: "Cancelled",
                                    description: "Upload has been cancelled!",
                                    variant: "destructive",
                                    duration: 2000,
                                    action: undefined,
                                });
                            }}
                        >
                            <XSquareIcon />
                        </Button>
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

        let downloadURL = ""

        try {
            const snapshotRef = await uploadTask;
            downloadURL = await getDownloadURL(snapshotRef);
            uploadToast.update({
                id: uploadToast.id,
                title: "Success",
                description: "Upload completed!",
                variant: "success",
                duration: 2000,
                action: undefined,
            })
        } catch (error) {
            toastError(`${error}`);
        } finally {
            if (uploadTracker) {
                clearInterval(uploadTracker);
            }
        }

        return downloadURL
    };

    const uploadFiles = async (files: File[], path: string) => {
        const urls = await Promise.all(files.map(async (file, index, original) => {
            return await uploadFile(file, `${path}/${file.name}`, index, original.length)
        }))
        return urls
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
        uploadFiles,
    };
};

export default useFileUpload;
