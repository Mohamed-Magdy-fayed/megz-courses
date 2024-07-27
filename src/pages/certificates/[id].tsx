import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { format } from "date-fns";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const CertificatePage: NextPage = () => {
    const router = useRouter()
    const id = router.query.id as string
    const { data } = api.certificates.getCertificateById.useQuery({ id }, { enabled: !!id })

    return (
        <AppLayout>
            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <ConceptTitle>{data?.certificate?.course?.name} Course Certificate</ConceptTitle>
                    </div>
                </div>
                {data?.certificate ? (
                    <PaperContainer>
                        <Certificate
                            certificateId={data.certificate.certificateId || ""}
                            completionDate={format(data.certificate.completionDate || new Date(), "PP")}
                            courseName={data.certificate.course?.name || ""}
                            studentName={data.certificate.user?.name || ""}
                        />
                    </PaperContainer>
                ) : (
                    <Typography>Not ready yet</Typography>
                )}
            </div>
        </AppLayout>
    )
}

type CertificateProps = {
    studentName: string,
    courseName: string,
    completionDate: string,
    certificateId: string,
}

const Certificate = ({ studentName, courseName, completionDate, certificateId }: CertificateProps) => {
    return (
        <Card className="border-2 border-foreground p-10 w-4/5 mx-auto my-10 text-center">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Certificate of Completion</CardTitle>
                <CardDescription>This certifies that</CardDescription>
            </CardHeader>
            <CardContent>
                <h2 className="text-xl font-semibold my-2">{studentName}</h2>
                <p>has successfully completed the course</p>
                <h3 className="text-lg font-semibold my-2">{courseName}</h3>
                <p>on</p>
                <h4 className="text-md font-medium my-2">{completionDate}</h4>
                <p>Certificate ID: {certificateId}</p>
            </CardContent>
        </Card>
    );
};

export default CertificatePage
