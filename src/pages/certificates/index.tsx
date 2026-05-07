import AppLayout from "@/components/pages/adminLayout/AppLayout";
import CertificatesClient from "@/components/admin/usersManagement/users/accountComponents/certificates/CertificateClient";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import type { NextPage } from "next";

const CertificatesPage: NextPage = () => {
    const { data, isLoading } = api.certificates.getAllCertificates.useQuery();

    const formattedData =
        data?.certificates.map((certificate) => ({
            id: certificate.id,
            certificateId: certificate.certificateId,
            completionDate: certificate.completionDate,
            courseName: certificate.course?.name || "",
            levelName: certificate.courseLevel?.name || "",
            createdAt: certificate.createdAt,
            updatedAt: certificate.updatedAt,
        })) || [];

    return (
        <AppLayout>
            <main className="space-y-4">
                <ConceptTitle>Certificates</ConceptTitle>
                {isLoading ? null : <CertificatesClient formattedData={formattedData} />}
            </main>
        </AppLayout>
    );
};

export default CertificatesPage;
