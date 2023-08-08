import { talkback } from "@/lib/talkback";
import { cn } from "@/lib/utils";
import { ButtonProps, IconButton } from "@mui/material";
import { PlayCircle } from "lucide-react";
import { ReactNode } from "react";

interface TextToSpeechProps extends ButtonProps {
  text: string;
  children?: ReactNode;
  className?: string;
}

const TextToSpeech = ({
  text,
  children,
  className,
  ...rest
}: TextToSpeechProps) => {
  return (
    <div className="flex items-center gap-2">
      <div>{children}</div>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          talkback(text);
        }}
        size="small"
        className={cn(className)}
        {...rest}
      >
        <PlayCircle></PlayCircle>
      </IconButton>
    </div>
  );
};

export default TextToSpeech;
