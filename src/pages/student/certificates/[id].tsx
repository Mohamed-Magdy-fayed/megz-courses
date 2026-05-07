import AppLayout from "@/components/pages/adminLayout/AppLayout";
import { Button } from "@/components/ui/button";
import CertificateCanvas from "@/components/general/certificates/CertificateCanvas";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { downloadCertificatePdf, downloadCertificatePng } from "@/lib/certificateExport";
import { format } from "date-fns";
import { DownloadIcon, FileTextIcon } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useRef } from "react";

const CertificatePage: NextPage = () => {
    const router = useRouter()
    const id = router.query.id as string
    const printRef = useRef<HTMLDivElement>(null);
    const { data } = api.certificates.getCertificateById.useQuery({ id }, { enabled: !!id })

    const handleDownload = async () => {
        if (!printRef.current || !data?.certificate?.certificateId) return;
        await downloadCertificatePng(printRef.current, data.certificate.certificateId);
    };

    const handleDownloadPdf = async () => {
        if (!printRef.current || !data?.certificate?.certificateId) return;
        await downloadCertificatePdf(printRef.current, data.certificate.certificateId);
    };

    return (
        <AppLayout>
            <Head>
                <title>{data?.certificate?.user?.name} Certificate</title>
                <meta
                    name="description"
                    content={`Certificate ID: ${data?.certificate?.certificateId}`}
                />
            </Head>
            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <ConceptTitle>{data?.certificate?.course?.name} Course Certificate</ConceptTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={"icon"} customeColor={"infoIcon"} onClick={handleDownload}>
                                    <DownloadIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Download PNG
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={"icon"} customeColor={"infoIcon"} onClick={handleDownloadPdf}>
                                    <FileTextIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Download PDF
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
                {data?.certificate ? (
                    <div ref={printRef}>
                        <CertificateCanvas
                            certificateId={data.certificate.certificateId || ""}
                            completionDate={format(data.certificate.completionDate || new Date(), "PP")}
                            courseName={data.certificate.course?.name || ""}
                            studentName={data.certificate.user?.name || ""}
                            trainerName={data.certificate.user.zoomGroups.find(g => g.courseId === data.certificate?.course?.id && g.courseLevelId === data.certificate?.courseLevelId)?.teacher?.user.name || ""}
                        />
                    </div>
                ) : (
                    <Typography>Not ready yet</Typography>
                )}
            </div>
        </AppLayout>
    )
}

export default CertificatePage
