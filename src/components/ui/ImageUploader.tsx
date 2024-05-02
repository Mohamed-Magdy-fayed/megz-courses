"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageOff, ImagePlus, Trash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Skeleton } from "./skeleton";
import { Input } from "./input";
import { api } from "@/lib/api";
import { useToast } from "./use-toast";
import Spinner from "../Spinner";
import { Typography } from "./Typoghraphy";
import clsx from "clsx";
import { getFile, uploadFile } from "@/lib/firebaseStorage";

interface ImageUploaderProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: () => void;
    value?: string;
    customeImage?: ReactNode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    onChange,
    onRemove,
    value,
    disabled,
    customeImage,
}) => {
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { toastError } = useToast();
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleUpload = async (file: File) => {
        setLoading(true)
        const imagePath = await uploadFile(file);
        const imageUrl = await getFile(imagePath);
        onChange(imageUrl);
        setLoading(false)
    };

    if (!isMounted) return null;

    return (
        <div>
            <div className="flex items-center justify-between gap-4 py-4">
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
                                <Spinner className={clsx("opacity-0 absolute w-8 h-8 z-50", loading && "opacity-100")} />
                            </div>
                        )}
                        <div className="">
                            <Button
                                variant={"icon"}
                                customeColor={"destructiveIcon"}
                                onClick={() => {
                                    onRemove()
                                    if (!inputRef.current) return
                                    inputRef.current.value = ""
                                }}
                                className=""
                            >
                                <Trash className="h-4 w-4 text-error" />
                            </Button>
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
                    onChange={(e) => handleUpload(e.target.files![0]!)}
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
                    className="relative"
                >
                    <ImagePlus className={clsx("mr-2 h-4 w-4", loading && "opacity-0")} />
                    <Typography className={clsx("", loading && "opacity-0")}>Upload an image</Typography>
                    {loading && <Spinner className="h-4 w-4 absolute" />}
                </Button>
            </div>
        </div>
    );
};

export default ImageUploader;
