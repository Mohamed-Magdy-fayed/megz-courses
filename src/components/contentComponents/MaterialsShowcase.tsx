import { PaperContainer } from "@/components/ui/PaperContainers";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { IconButton, Typography } from "@mui/material";
import { Edit, Edit2, Trash, X } from "lucide-react";
import { useRouter } from "next/router";
import { MaterialItem } from "@prisma/client";
import { useToastStore } from "@/zustand/store";
import { Separator } from "@/components/ui/separator";

const MaterialsShowcase = ({ data }: { data: MaterialItem[] }) => {
  const deleteLessonsMutation = api.lessons.deleteLessons.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();

  const handleDelete = (id: string) => {
    deleteLessonsMutation.mutate([id], {
      onSuccess: () => {
        toast.success(`Deleted!`);
        trpcUtils.lessons.invalidate();
      },
      onError: () => {
        toast.error("an error occured!");
      },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((material) => (
        <div key={material.id}>
          <PaperContainer>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-2">
                  <Typography>{material.title}</Typography>
                </div>
                <IconButton
                  onClick={() =>
                    router.push(`/content/materials/${material.id}`)
                  }
                >
                  <Edit2 className="h-4 w-4" />
                </IconButton>
              </div>
              <IconButton
                className="text-error hover:bg-red-100"
                onClick={() => handleDelete(material.id)}
              >
                <Trash className="h-4 w-4" />
              </IconButton>
            </div>
            <Separator />
            <div className="flex w-full p-4">
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() =>
                  router.push(`/content/materials/${material.id}/show`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Showcase
              </Button>
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() => router.push(`/content/materials/${material.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Configure materials
              </Button>
            </div>
          </PaperContainer>
        </div>
      ))}
    </div>
  );
};

export default MaterialsShowcase
