import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { useState } from "react";
import { FileDown, FileUp, ListChecks, PlusIcon, Workflow } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import TrainerForm from "@/components/staffComponents/TrainerForm";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import TrainersClient from "@/components/staffComponents/TrainersClient";
import Link from "next/link";

const StaffPage = () => {
  const { data, isLoading, isError } = api.trainers.getTrainers.useQuery();
  const { data: currentTrainerData } = api.trainers.getCurrentTrainer.useQuery();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppLayout>
      <main>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <ConceptTitle>Teachers</ConceptTitle>
              <div className="flex items-center justify-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={"icon"} customeColor={"infoIcon"}>
                      <FileDown />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Typography>Import</Typography>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={"icon"} customeColor={"infoIcon"}>
                      <FileUp />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Typography>Export</Typography>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="space-x-4">
              {currentTrainerData?.trainer && (
                <Link href={`/staff/my_tasks`}>
                  <Button customeColor={"primary"}>
                    <ListChecks className="mr-2"></ListChecks>
                    <Typography variant={"buttonText"}>My Tasks</Typography>
                  </Button>
                </Link>
              )}
              <Button onClick={() => setIsOpen(true)} customeColor={"primary"}>
                <PlusIcon className="mr-2"></PlusIcon>
                <Typography variant={"buttonText"}>Add</Typography>
              </Button>
            </div>
          </div>
          {isOpen && (
            <PaperContainer>
              <TrainerForm setIsOpen={setIsOpen}></TrainerForm>
            </PaperContainer>
          )}
          <PaperContainer>
            {isLoading ? (
              <Spinner></Spinner>
            ) : isError ? (
              <>Error</>
            ) : (
              <TrainersClient data={data.trainers}></TrainersClient>
            )}
          </PaperContainer>
        </div>
      </main>
    </AppLayout>
  );
};

export default StaffPage;
