import { useCallback, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import ImageUploader from "../ui/ImageUploader";

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
  const [result, setResult] = useState<string>("");

  const handleUpload = useCallback((res: any) => {
    setResult(res);
    handleChange(res);
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <ImageUploader
            onChange={handleUpload}
            disabled={loading}
            value={result}
            customeImage={<></>}
            customeButton={(
              <>
                <ImagePlus className="mr-2"></ImagePlus>
                {isAccount
                  ? "Change Image"
                  : "Choose an image"
                }
              </>
            )}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {!result && !isAccount ? "upload an image" : "change"}
      </TooltipContent>
    </Tooltip>
  );
}
