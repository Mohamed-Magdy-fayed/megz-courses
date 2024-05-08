"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageOff, ImagePlus, Trash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Skeleton } from "./skeleton";
import { Input } from "./input";
import { Typography } from "./Typoghraphy";
import { StorageReference, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/config/firebase";
import { Progress } from "./progress";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
    disabled?: boolean;
    value?: string;
    onChange: (url: string) => void;
    onRemove?: () => void;
    customeImage?: ReactNode;
    customeButton?: ReactNode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    onChange,
    onRemove,
    value,
    disabled,
    customeImage,
    customeButton,
}) => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleImageChange = async (file: File) => {
        const filename = file.name;
        const storageRef = ref(
            storage,
            `uploads/${filename}`
        );

        const uploadTask = new Promise<StorageReference>((resolve, reject) => {
            const task = uploadBytesResumable(storageRef, file);

            task.on('state_changed',
                ({ bytesTransferred, totalBytes }) => setProgress(bytesTransferred / totalBytes),
                (error) => reject(error),
                () => resolve(task.snapshot.ref),
            );
        });

        try {
            setLoading(true)
            const snapshotRef = await uploadTask;
            const downloadURL = await getDownloadURL(snapshotRef);
            onChange(downloadURL)
            setProgress(0)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            throw new Error(`Error uploading file: ${error}`);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="flex items-center justify-between gap-4 py-4 w-full">
            {value && value.length > 0 ? (
                <div className="flex gap-4 rounded-md items-center">
                    {customeImage ? customeImage : (
                        <div className="relative grid justify-items-center items-center">
                            <Avatar className="w-20 h-20">
                                <AvatarImage alt="user image" src={value} />
                                <AvatarFallback>
                                    <Skeleton className="w-full h-full rounded-full" />
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    )}
                    <div>
                        {onRemove && (
                            <Button
                                variant={"icon"}
                                customeColor={"destructiveIcon"}
                                onClick={() => {
                                    onRemove()
                                    if (!inputRef.current) return
                                    inputRef.current.value = ""
                                }}
                                type="button"
                            >
                                <Trash className="h-4 w-4 text-error" />
                            </Button>
                        )}
                    </div>
                </div>
            ) : customeImage ? customeImage : (
                <div className="rounded-md w-20 h-20">
                    <Skeleton className="w-full h-full rounded-full grid place-content-center">
                        <ImageOff></ImageOff>
                    </Skeleton>
                </div>
            )}
            <Input
                disabled={disabled}
                onChange={(e) => handleImageChange(e.target.files![0]!)}
                type="file"
                accept="image/*"
                className="hidden"
                ref={inputRef}
            />
            <Button
                type="button"
                disabled={disabled || loading}
                variant="outline"
                customeColor="primaryOutlined"
                onClick={() => inputRef.current?.click()}
                className={cn("relative overflow-hidden")}
            >
                {customeButton ? customeButton : (
                    <>
                        {progress > 0 && <Progress value={progress} className="absolute h-full rounded-none opacity-40" />}
                        <ImagePlus className={cn("mr-2 h-4 w-4")} />
                        <Typography>Upload an image</Typography>
                    </>
                )}
            </Button>
        </div>
    );
};

export default ImageUploader;
