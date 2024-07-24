import { api } from "@/lib/api";
import { format } from "date-fns";
import { DataTable } from "../ui/DataTable";
import { SessionColumn, columns } from "./SessionColumns";

const SessionsClient = () => {
  const { data } = api.trainers.getCurrentTrainerSessions.useQuery()

  const formattedData: SessionColumn[] = data?.sessions.map(session => ({
    id: session.id,
    title: session.materialItem?.title || "",
    userName: session.zoomGroup?.trainer?.user.name || "",
    userEmail: session.zoomGroup?.trainer?.user.email || "",
    groupId: session.zoomGroup?.id || "",
    status: session.sessionStatus || "",
    meetingNumber: session.zoomGroup?.meetingNumber || "",
    meetingPassword: session.zoomGroup?.meetingPassword || "",
    isSessionOngoing: session.sessionStatus === "ongoing",
    createdAt: format(session.createdAt, "PPP"),
  })) || [];

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setData={() => { }}
      searches={[{
        key: "id",
        label: "Id"
      }]}
    />
  );
};

export default SessionsClient;
