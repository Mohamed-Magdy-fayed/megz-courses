import LearningLayout from "@/components/pages/LearningLayout/LearningLayout";
import Spinner from "@/components/ui/Spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

const CertificatePage: NextPage = () => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string
    const levelSlug = router.query.levelSlug as string
    const { data, isLoading } = api.certificates.getCertificate.useQuery({ courseSlug, levelSlug }, { enabled: !!courseSlug && !!levelSlug })

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (printRef.current) {
            window.print();
        }
    };

    if (isLoading) return (
        <LearningLayout>
            <Spinner className="mx-auto" />
        </LearningLayout>
    )

    return (
        <LearningLayout>
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
                        <ConceptTitle>{data?.certificate?.course?.name} Certificate</ConceptTitle>
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={"icon"} customeColor={"infoIcon"} onClick={() => handlePrint()}>
                                <Printer />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Print
                        </TooltipContent>
                    </Tooltip>
                </div>
                {data?.certificate ? (
                    <div ref={printRef}>
                        <Certificate
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
        </LearningLayout>
    )
}

type CertificateProps = {
    studentName: string,
    courseName: string,
    trainerName: string,
    completionDate: string,
    certificateId: string,
}

const Certificate = ({ studentName, courseName, trainerName, completionDate, certificateId }: CertificateProps) => {
    const { data, refetch } = api.siteIdentity.getSiteIdentity.useQuery(undefined, { enabled: false })

    useEffect(() => { refetch() }, [])

    return (
        <div className="items-center flex flex-col">
            <Card
                className="printable border-2 w-[850px] h-[600px] relative border-foreground mx-auto my-10 text-center bg-no-repeat bg-[url(/certificate.jpg)] bg-cover"
            >
                <Image src={`/certificate.jpg`} width={1000} height={1000} className="opacity-0 w-4/5" alt="background" />
                <Avatar className="absolute w-24 h-24 top-10 left-10">
                    <AvatarImage src={data?.siteIdentity.logoPrimary} />
                    <AvatarFallback>Logo</AvatarFallback>
                </Avatar>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Certificate of Completion</CardTitle>
                        <CardDescription>This certifies that</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h2 className="text-xl font-semibold my-2">{studentName}</h2>
                        <p>has successfully Completed the course</p>
                        <h3 className="text-lg font-semibold my-2">{courseName}</h3>
                        <p>on</p>
                        <h4 className="text-md font-medium my-2">{completionDate}</h4>
                        <p>Certificate ID: {certificateId}</p>
                    </CardContent>
                </div>
                <CardFooter className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full">
                    <div className="flex justify-between items-center w-full px-8">
                        <div className="text-center">
                            <Typography variant="secondary" className="border-t border-foreground pt-2">
                                {data?.siteIdentity.name1} {data?.siteIdentity.name2}
                            </Typography>
                        </div>
                        <div className="text-center">
                            <Typography variant="secondary" className="border-t border-foreground pt-2">
                                {trainerName || "Course Instructor"}
                            </Typography>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default CertificatePage
