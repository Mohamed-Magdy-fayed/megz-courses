"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { Skeleton } from "./skeleton";

interface MaterialImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  value?: string;
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
      <div className="flex items-center justify-between gap-4 p-4">
        {value && value.length > 0 ? (
          <div className="flex gap-4 rounded-md">
            <img alt="user image" src={value} className="max-h-60" />
            <div className="">
              <Button variant="x" onClick={() => onRemove()}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Skeleton className="h-[144px] w-[256px] rounded-md" />
        )}
        <CldUploadWidget onUpload={onUpload} uploadPreset="zaibke97">
          {({ open }) => {
            const onClick = () => {
              open();
            };

            return (
              <Button
                variant={"outline"}
                type="button"
                disabled={disabled}
                customeColor="primaryOutlined"
                onClick={onClick}
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                Upload
              </Button>
            );
          }}
        </CldUploadWidget>
      </div>
    </div>
  );
};

export default MaterialImageUpload;
