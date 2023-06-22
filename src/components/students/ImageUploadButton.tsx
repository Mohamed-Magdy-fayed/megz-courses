import React from "react";
import { Button, Input, Tooltip } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { CldUploadButton } from "next-cloudinary";

interface ImageUploadButtonProps {
  loading: boolean;
  handleChange: (url: string) => void;
}

export default function ImageUploadButton({
  loading,
  handleChange,
}: ImageUploadButtonProps) {
  const [result, setResult] = React.useState<any>(null);

  const handleUpload = React.useCallback((res: any) => {
    console.log(res);
    setResult(res);
    handleChange(res.info.secure_url);
  }, []);

  const button = (
    <Button
      disabled={loading}
      color="primary"
      variant="contained"
      component="div"
      className="relative whitespace-nowrap normal-case"
      size="small"
    >
      <FileUploadOutlinedIcon className="mr-2"></FileUploadOutlinedIcon>
      {!result
        ? "Choose an image"
        : `${result.info.original_filename}.${result.info.format}`}
    </Button>
  );

  return (
    <Tooltip title={!result ? "upload an image" : "change"}>
      <label htmlFor="uploadImage">
        <CldUploadButton
          options={{ maxFiles: 1, sources: ["local"] }}
          onUpload={handleUpload}
          uploadPreset="c7tkdxbg"
          children={button}
        />
      </label>
    </Tooltip>
  );
}
