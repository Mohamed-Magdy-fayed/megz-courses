import { Copy, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { } from "@/zustand/store";
import { useToast } from "./use-toast";

interface ApiAlertProps {
  title: string;
  description: string;
}

export const ApiAlert: React.FC<ApiAlertProps> = ({
  description,
  title,
}) => {
  const { toast } = useToast()
  const onCopy = () => {
    navigator.clipboard.writeText(description);
    toast({
      description: "API route copied to the clipboard",
      variant: "info"
    });
  };
  return (
    <Alert className="mt-4">
      <Server className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-x-2">
        {title}
      </AlertTitle>
      <AlertDescription className="mt-4 flex items-center justify-between">
        <code className="relative rounded bg-foreground/10 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          {description}
        </code>
        <Button variant="icon" customeColor={"primaryIcon"} onClick={onCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};
