import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { useState } from "react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import AppLayout from "@/components/layout/AppLayout";
import StudentForm from "@/components/studentComponents/StudentForm";
import StudentClient from "@/components/studentComponents/StudentClient";
import RetintionsClient from "@/components/retintionsComponents/RetintionsClient";

const RetintionsPage = () => {

  return (
    <AppLayout>
      <main className="flex">
        <div className="flex w-full flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <ConceptTitle>Retintions List</ConceptTitle>
              <Typography variant={"secondary"}>Students who Completed one or more courses</Typography>
            </div>
          </div>
          <PaperContainer>
            <RetintionsClient />
          </PaperContainer>
        </div>
      </main>
    </AppLayout>
  );
};

export default RetintionsPage;
