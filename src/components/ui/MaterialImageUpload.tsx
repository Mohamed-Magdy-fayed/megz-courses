"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { IconButton } from "@mui/material";
import { Skeleton } from "./skeleton";
import Image from "next/image";

interface MaterialImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string;
}

const MaterialImageUpload: React.FC<MaterialImageUploadProps> = ({
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
      <div className="mb-4 flex items-center gap-4 p-4">
        <div
          key={value}
          className="relative h-[200px] w-[200px] overflow-hidden rounded-md"
        >
          <div className="absolute right-2 top-2 z-10">
            <Button
              type="button"
              onClick={() => onRemove(value)}
              variant="destructive"
              size="icon"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          {value.length > 0 ? (
            <Image fill className="object-cover" alt="Image" src={value} />
          ) : (
            <Skeleton className="h-[200px] w-[200px]"></Skeleton>
          )}
        </div>
        <CldUploadWidget onUpload={onUpload} uploadPreset="zaibke97">
          {({ open }) => {
            const onClick = () => {
              open();
            };

            return (
              <Button
                type="button"
                disabled={disabled}
                variant="secondary"
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

export default MaterialImageUpload;
