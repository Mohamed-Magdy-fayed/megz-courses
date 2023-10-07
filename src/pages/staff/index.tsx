import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { useState } from "react";
import { FileDown, FileUp, PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import UserForm from "@/components/staffComponents/UserForm";
import StaffClient from "@/components/staffComponents/StaffClient";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const StaffPage = () => {
  const { data, isLoading, isError } = api.users.getUsers.useQuery({
    userType: "teacher",
  });
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
            <Button onClick={() => setIsOpen(true)} customeColor={"primary"}>
              <PlusIcon className="mr-2"></PlusIcon>
              <Typography variant={"buttonText"}>Add</Typography>
            </Button>
          </div>
          {isOpen && (
            <PaperContainer>
              <UserForm setIsOpen={setIsOpen}></UserForm>
            </PaperContainer>
          )}
          <PaperContainer>
            {isLoading ? (
              <Spinner></Spinner>
            ) : isError ? (
              <>Error</>
            ) : (
              <StaffClient data={data.users}></StaffClient>
            )}
          </PaperContainer>
        </div>
      </main>
    </AppLayout>
  );
};

export default StaffPage;
