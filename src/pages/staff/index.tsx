import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { useState } from "react";
import { ListChecks, PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import TrainerForm from "@/components/staffComponents/TrainerForm";
import TrainersClient from "@/components/staffComponents/TrainersClient";
import Link from "next/link";
import Modal from "@/components/ui/modal";

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
            </div>
            <div className="space-x-4">
              {currentTrainerData?.trainer?.role === "tester" && (
                <Link href={`/staff/my_tasks`}>
                  <Button customeColor={"primary"}>
                    <ListChecks className="mr-2"></ListChecks>
                    <Typography variant={"buttonText"}>My Tasks</Typography>
                  </Button>
                </Link>
              )}
              {currentTrainerData?.trainer?.role === "teacher" && (
                <Link href={`/staff/my_sessions`}>
                  <Button customeColor={"primary"}>
                    <ListChecks className="mr-2"></ListChecks>
                    <Typography variant={"buttonText"}>My Sessions</Typography>
                  </Button>
                </Link>
              )}
              <Button onClick={() => setIsOpen(true)} customeColor={"primary"}>
                <PlusIcon className="mr-2"></PlusIcon>
                <Typography variant={"buttonText"}>Add</Typography>
              </Button>
            </div>
          </div>
          <Modal
            title="Create User"
            description="Add a new User"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            children={(
              <TrainerForm setIsOpen={setIsOpen}></TrainerForm>
            )}
          />
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
