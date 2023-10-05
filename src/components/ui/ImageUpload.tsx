"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageOff, ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Skeleton } from "./skeleton";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  value?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  onRemove,
  value,
  disabled,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = (res: any) => {
    onChange(res.info.secure_url);
  };

  if (!isMounted) return null;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 py-4">
        {value && value.length > 0 ? (
          <div className="flex gap-4 rounded-md items-center">
            <Avatar className="w-20 h-20">
              <AvatarImage alt="user image" src={value} />
              <AvatarFallback>
                <Skeleton className="w-full h-full rounded-full" />
              </AvatarFallback>
            </Avatar>
            <div className="">
              <Button
                variant={"icon"}
                customeColor={"destructiveIcon"}
                onClick={() => onRemove()}
                className=""
              >
                <Trash className="h-4 w-4 text-error" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-md w-20 h-20">
            <Skeleton className="w-full h-full rounded-full grid place-content-center">
              <ImageOff></ImageOff>
            </Skeleton>
          </div>
        )}
        <CldUploadWidget onUpload={onUpload} uploadPreset="zaibke97">
          {({ open }) => {
            const onClick = () => {
              open();
            };

            return (
              <Button
                type="button"
                disabled={disabled}
                variant="outline"
                customeColor="primaryOutlined"
                onClick={onClick}
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                Upload an image
              </Button>
            );
          }}
        </CldUploadWidget>
      </div>
    </div>
  );
};

export default ImageUpload;
