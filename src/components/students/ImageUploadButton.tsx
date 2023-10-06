import { CldUploadButton } from "next-cloudinary";
import { useCallback, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";

interface ImageUploadButtonProps {
  loading: boolean;
  isAccount?: boolean;
  handleChange: (url: string) => void;
}

export default function ImageUploadButton({
  loading,
  isAccount,
  handleChange,
}: ImageUploadButtonProps) {
  const [result, setResult] = useState<any>(null);

  const handleUpload = useCallback((res: any) => {
    console.log(res);
    setResult(res);
    handleChange(res.info.secure_url);
  }, []);

  const button = (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={
            cn("h-10 px-4 py-2 inline-flex items-center space-x-2 active:opacity-75 justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative whitespace-nowrap normal-case bg-primary text-primary-foreground hover:bg-primary-hover",
              loading && "bg-muted pointer-events-none")
          }
        >
          <ImagePlus className="mr-2"></ImagePlus>
          {isAccount
            ? "Change Image"
            : !result && !isAccount
              ? "Choose an image"
              : `${result.info.original_filename}.${result.info.format}`}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {!result && !isAccount ? "upload an image" : "change"}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <CldUploadButton
      options={{ maxFiles: 1, sources: ["local"] }}
      onUpload={handleUpload}
      uploadPreset="c7tkdxbg"
      children={button}
    />
  );
}
