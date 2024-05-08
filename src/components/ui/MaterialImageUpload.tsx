"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Skeleton } from "./skeleton";
import ImageUploader from "./ImageUploader";

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

  if (!isMounted) return null;

  return (
    <div className="flex items-center justify-between gap-4 p-4 w-full">
      <ImageUploader
        disabled={disabled}
        onChange={onChange}
        customeImage={value && value.length > 0 ? (
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
      />
    </div>
  );
};

export default MaterialImageUpload;
