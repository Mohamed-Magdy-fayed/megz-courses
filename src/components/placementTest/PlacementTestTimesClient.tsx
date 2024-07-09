import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { PlacementTestTimesColumn, columns } from "./PlacementTestTimesColumn";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import Spinner from "../Spinner";

const PlacementTestTimesClient = () => {
  const { data: PlacementTestTimesData } = api.placementTestsTimes.getPlacementTestTimes.useQuery()
  const [ids, setIds] = useState<PlacementTestTimesColumn[]>([]);
  const formattedData: PlacementTestTimesColumn[] = PlacementTestTimesData?.placementTestsTimes ? PlacementTestTimesData.placementTestsTimes.map((time) => ({
    id: time.id,
    time: format(time.testTime, "PPPp"),
    updatedAt: format(time.updatedAt, "MMMM do, yyyy"),
    createdAt: format(time.createdAt, "MMMM do, yyyy"),
  })) : [];

  const deleteMutation = api.placementTestsTimes.deletePlacementTestTimes.useMutation();
  const trpcUtils = api.useContext();
  const { toastError, toastSuccess } = useToast()

  const onDelete = (callback?: () => void) => {
    deleteMutation.mutate(
      { ids: ids.map(({ id }) => (id)) },
      {
        onSuccess: () => {
          trpcUtils.placementTestsTimes.invalidate()
            .then(() => {
              toastSuccess("Time(s) deleted")
              callback?.()
            });
        },
        onError: (error) => {
          toastError(error.message)
        },
      }
    );
  };

  if (!PlacementTestTimesData?.placementTestsTimes) return <Spinner className="mx-auto" />

  return (
    <DataTable
      columns={columns}
      data={formattedData || []}
      setData={setIds}
      onDelete={onDelete}
    />
  );
};

export default PlacementTestTimesClient;
