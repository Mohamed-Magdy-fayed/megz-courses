import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { PaperContainer } from "@/components/ui/PaperContainers";
import AppLayout from "@/components/layout/AppLayout";
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
