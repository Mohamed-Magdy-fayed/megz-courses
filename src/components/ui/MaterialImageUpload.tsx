"use client";

import { useEffect, useState } from "react";
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
    <ImageUploader
      disabled={disabled}
      onRemove={onRemove}
      onChange={onChange}
      customeImage={value && value.length > 0 ? (
        <img alt="user image" src={value} className="max-h-[72px]" />
      ) : (
        <Skeleton className="h-[72px] w-[128px] rounded-md" />
      )}
    />
  );
};

export default MaterialImageUpload;
