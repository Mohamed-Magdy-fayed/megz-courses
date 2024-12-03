import { Copy, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { } from "@/zustand/store";
import { useToast } from "./use-toast";
import { cn } from "@/lib/utils";

interface ApiAlertProps {
  title: string;
  description: string;
  disabled?: boolean;
}

export const ApiAlert: React.FC<ApiAlertProps> = ({
  description,
  title,
  disabled,
}) => {
  const { toastInfo } = useToast()
  const onCopy = () => {
    navigator.clipboard.writeText(description);
    toastInfo("API route copied to the clipboard");
  };
  return (
    <Alert className={cn("mt-4", disabled && "select-none")}>
      <Server className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-x-2">
        {title}
      </AlertTitle>
      <AlertDescription className="mt-4 flex items-center justify-between">
        <code className="relative rounded bg-foreground/10 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          {description}
        </code>
        <Button disabled={disabled} type="button" variant="icon" customeColor={"primaryIcon"} onClick={onCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};
