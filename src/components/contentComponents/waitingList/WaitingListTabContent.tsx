import { PaperContainer } from "@/components/ui/PaperContainers";
import WaitingListClient from "@/components/contentComponents/waitingList/WaitingListClient";
import { WaitingListRow } from "@/components/contentComponents/waitingList/WaitingListColumn";

const WaitingListTabContent = ({ formattedData }: { formattedData: WaitingListRow[] }) => {

    return (
        <PaperContainer>
            <WaitingListClient formattedData={formattedData} />
        </PaperContainer>
    )
}

export default WaitingListTabContent