import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/modal";
import StudentForm from "@/components/admin/usersManagement/students/StudentForm";
import StudentClient from "@/components/admin/usersManagement/students/StudentClient";

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
