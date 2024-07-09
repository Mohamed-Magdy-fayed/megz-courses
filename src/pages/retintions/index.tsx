import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { useState } from "react";
import { FileDown, FileUp } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import StudentForm from "@/components/studentComponents/StudentForm";
import StudentClient from "@/components/studentComponents/StudentClient";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const RetintionsPage = () => {
  const { data, isLoading, isError } = api.users.getRetintionsUsers.useQuery();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppLayout>
      <main className="flex">
        <div className="flex w-full flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <ConceptTitle>Retintions List</ConceptTitle>
              <Typography variant={"secondary"}>Students who completed one or more courses</Typography>
              <div className="flex items-center gap-2">
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
          </div>
          {isOpen && (
            <PaperContainer>
              <StudentForm setIsOpen={setIsOpen}></StudentForm>
            </PaperContainer>
          )}
          <PaperContainer>
            {isLoading ? (
              <div className="w-full h-full grid place-content-center">
                <Spinner></Spinner>
              </div>
            ) : isError ? (
              <>Error</>
            ) : (
              <StudentClient data={data.users}></StudentClient>
            )}
          </PaperContainer>
        </div>
      </main>
    </AppLayout>
  );
};

export default RetintionsPage;
