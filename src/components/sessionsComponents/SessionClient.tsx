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
    userName: session.zoomGroup?.teacher?.user.name || "",
    userEmail: session.zoomGroup?.teacher?.user.email || "",
    groupId: session.zoomGroup?.id || "",
    groupName: session.zoomGroup?.groupNumber || "",
    status: session.sessionStatus || "",
    meetingNumber: session.zoomGroup?.meetingNumber || "",
    meetingPassword: session.zoomGroup?.meetingPassword || "",
    isSessionOngoing: session.sessionStatus === "Ongoing",
    sessionName: session.materialItem?.title || "",
    sessionDate: session.sessionDate,
    createdAt: format(session.createdAt, "PPP"),
  })) || [];

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setData={() => { }}
      searches={[{
        key: "sessionName",
        label: "Session Title"
      }]}
      filters={[
        { key: "status", filterName: "Status", values: validSessionStatuses.map(s => ({ label: upperFirst(s), value: s })) },
        { key: "groupName", filterName: "Group", values: uniqBy(formattedData.map(d => ({ value: d.groupName, label: d.groupName })), "value") },
      ]}
      dateRanges={[{ key: "sessionDate", label: "Session Time" }]}
    />
  );
};

export default SessionsClient;
