import { PaperContainer } from "@/components/ui/PaperContainers";
import WaitingListClient from "@/components/admin/systemManagement/contentComponents/waitingList/WaitingListClient";
import { WaitingListRow } from "@/components/admin/systemManagement/contentComponents/waitingList/WaitingListColumn";

const WaitingListTabContent = ({ formattedData }: { formattedData: WaitingListRow[] }) => {

    return (
        <PaperContainer>
            <WaitingListClient formattedData={formattedData} />
        </PaperContainer>
    )
}

export default WaitingListTabContent