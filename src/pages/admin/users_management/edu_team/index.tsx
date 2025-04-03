import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { useState } from "react";
import { ListChecks, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/pages/adminLayout/AppLayout";
import Link from "next/link";
import Modal from "@/components/ui/modal";
import TrainerForm from "@/components/admin/usersManagement/staffComponents/TrainerForm";
import TrainersClient from "@/components/admin/usersManagement/staffComponents/TrainersClient";

const EducationalTeamPage = () => {
  const { data: currentTrainerData } = api.trainers.getCurrentTrainer.useQuery();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppLayout>
      <main>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <ConceptTitle>Educational Team</ConceptTitle>
            </div>
            <div className="space-x-4">
              {currentTrainerData?.trainer?.user.userRoles.includes("Tester") && (
                <Link href={`/admin/users_management/edu_team/my_tasks`}>
                  <Button customeColor={"primary"}>
                    <ListChecks className="mr-2"></ListChecks>
                    <Typography variant={"buttonText"}>My Tasks</Typography>
                  </Button>
                </Link>
              )}
              {currentTrainerData?.trainer?.user.userRoles.includes("Teacher") && (
                <Link href={`/admin/users_management/edu_team/my_sessions`}>
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
          <TrainersClient />
        </div>
      </main>
    </AppLayout>
  );
};

export default EducationalTeamPage;
