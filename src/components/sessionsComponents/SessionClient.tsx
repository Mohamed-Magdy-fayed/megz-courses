import { api } from "@/lib/api";
import { format } from "date-fns";
import { DataTable } from "../ui/DataTable";
import { SessionColumn, columns } from "./SessionColumns";
import { validSessionStatuses } from "@/lib/enumsTypes";
import { uniqBy, upperFirst } from "lodash";

const SessionsClient = () => {
  const { data } = api.trainers.getCurrentTrainerSessions.useQuery()

  const formattedData: SessionColumn[] = data?.sessions.map(session => ({
    id: session.id,
    title: session.materialItem?.title || "",
    userName: session.zoomGroup?.trainer?.user.name || "",
    userEmail: session.zoomGroup?.trainer?.user.email || "",
    groupId: session.zoomGroup?.id || "",
    groupName: session.zoomGroup?.groupNumber || "",
    status: session.sessionStatus || "",
    meetingNumber: session.zoomGroup?.meetingNumber || "",
    meetingPassword: session.zoomGroup?.meetingPassword || "",
    isSessionOngoing: session.sessionStatus === "ongoing",
    sessionDate: format(session.sessionDate, "PPPp"),
    createdAt: format(session.createdAt, "PPP"),
  })) || [];

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setData={() => { }}
      searches={[{
        key: "sessionDate",
        label: "Time"
      }]}
      filters={[
        { key: "status", filterName: "Status", values: validSessionStatuses.map(s => ({ label: upperFirst(s), value: s })) },
        { key: "groupName", filterName: "Group", values: uniqBy(formattedData.map(d => ({ value: d.groupName, label: d.groupName })), "value") },
      ]}
    />
  );
};

export default SessionsClient;
