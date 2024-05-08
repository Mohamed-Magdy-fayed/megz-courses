import { PaperContainer } from "../ui/PaperContainers";
import { Skeleton } from "../ui/skeleton";

const CardsSkeleton = () => {
  return (
    <>
      <PaperContainer>
        <Skeleton className="h-40 w-full"></Skeleton>
      </PaperContainer>
      <PaperContainer>
        <Skeleton className="h-40 w-full"></Skeleton>
      </PaperContainer>
      <PaperContainer>
        <Skeleton className="h-40 w-full"></Skeleton>
      </PaperContainer>
    </>
  );
};

export default CardsSkeleton;
