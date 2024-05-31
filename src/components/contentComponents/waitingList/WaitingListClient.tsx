import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { WaitingList, columns } from "./WaitingListColumn";

const WaitingListClient = ({ courseId }: { courseId: string }) => {
    const { data } = api.courses.getWaitingList.useQuery({ id: courseId })

    const formattedData: WaitingList[] = data?.watingUsers ? data.watingUsers.map(({
        id,
        name,
        image,
        device,
        email,
        phone,
        orders,
        createdAt,
        updatedAt,
    }) => ({
        id,
        name,
        image,
        device,
        email,
        phone,
        orders,
        courseId,
        createdAt,
        updatedAt,
    })) : []

    if (!data?.watingUsers) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
            onDelete={() => { }}
            search={{ key: "email", label: "Email" }}
        />
    );
};

export default WaitingListClient;
