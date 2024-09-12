import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import StudentForm from "@/components/studentComponents/StudentForm";
import StudentClient from "@/components/studentComponents/StudentClient";
import Modal from "@/components/ui/modal";

const StudentsPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppLayout>
      <main className="flex">
        <div className="flex w-full flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <ConceptTitle>Students</ConceptTitle>
            </div>
            <Button onClick={() => setIsOpen(true)} customeColor={"primary"}>
              <PlusIcon className="mr-2"></PlusIcon>
              <Typography variant={"buttonText"}>Add</Typography>
            </Button>
          </div>
          <Modal
            title="Create User"
            description="Add a new User"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            children={(
              <StudentForm setIsOpen={setIsOpen}></StudentForm>
            )}
          />
          <PaperContainer>
            <StudentClient />
          </PaperContainer>
        </div>
      </main>
    </AppLayout>
  );
};

export default StudentsPage;
