import { api } from "@/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { DataTable } from "../ui/DataTable";
import { SessionColumn, columns } from "./SessionColumns";
import { useToast } from "../ui/use-toast";

const SessionsClient = () => {
  const [trainers, setTraiers] = useState<SessionColumn[]>([]);

  const { data } = api.trainers.getCurrentTrainerSessions.useQuery()

  const formattedData: SessionColumn[] = data?.trainer?.groups.flatMap((group) => group.zoomSessions).map(session => ({
    id: session.id,
    title: session.materialItem?.title || "",
    userName: data.trainer?.user.name || "",
    userEmail: data.trainer?.user.email || "",
    groupNumber: session.zoomGroup?.groupNumber || "",
    meetingNumber: session.zoomGroup?.meetingNumber || "",
    meetingPassword: session.zoomGroup?.meetingPassword || "",
    isSessionOngoing: session.sessionStatus === "ongoing",
    createdAt: format(session.createdAt, "PPP"),
  })) || [];

  const { toastError, toastSuccess } = useToast();
  // const deleteMutation = api.trainers.deleteTrainer.useMutation();
  const trpcUtils = api.useContext();

  const onDelete = (callback?: () => void) => {
    // deleteMutation.mutate(
    //   trainers.map(({ userId }) => userId),
    //   {
    //     onSuccess: () => {
    //       trpcUtils.trainers.invalidate()
    //         .then(() => {
    //           callback?.()
    //           toastSuccess("Trainer(s) deleted")
    //         });
    //     },
    //     onError: (error) => {
    //       toastError(error.message)
    //     },
    //   }
    // );
  };

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setData={setTraiers}
      onDelete={onDelete}
      search={{
        key: "id",
        label: "Id"
      }}
    />
  );
};

export default SessionsClient;
