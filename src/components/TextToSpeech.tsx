import { talkback } from "@/lib/talkback";
import { cn } from "@/lib/utils";
import { PlayCircle } from "lucide-react";
import { ReactNode } from "react";
import { Button, ButtonProps } from "./ui/button";

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
      <Button
        variant={"icon"}
        customeColor={"infoIcon"}
        onClick={(e) => {
          e.stopPropagation();
          talkback(text);
        }}
        className={cn(className)}
        {...rest}
      >
        <PlayCircle></PlayCircle>
      </Button>
    </div>
  );
};

export default TextToSpeech;
