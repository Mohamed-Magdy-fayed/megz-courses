import { DataTable } from "@/components/ui/DataTable";
import { CertificateRow, columns } from "@/components/admin/usersManagement/users/accountComponents/certificates/Column";

const CertificatesClient = ({ formattedData }: { formattedData: CertificateRow[] }) => {
    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
            onDelete={() => { }}
            searches={[
                { key: "id", label: "ID" }
            ]}
        />
    );
};

export default CertificatesClient;
