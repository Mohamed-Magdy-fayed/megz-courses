import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import AccountHistory from "@/components/users/accountComponents/AccountHistory";
import AccountNotes from "@/components/users/accountComponents/AccountNotes";
import { useRouter } from "next/router";
import ZoomGroupsClient from "@/components/zoomGroupsComponents/Client";
import PlacmentTestScheduleClient from "@/components/contentComponents/placmentTestSchedule/PlacmentTestScheduleClient";
import { formatPercentage } from "@/lib/utils";
import CertificatesClient from "@/components/users/accountComponents/certificates/CertificateClient";
import { Prisma } from "@prisma/client";

const tabs = [
    { value: "notes", label: "Account Notes" },
    { value: "groups", label: "Groups" },
    { value: "placement_tests", label: "Placement tests" },
    { value: "certificates", label: "Certificates" },
    { value: "history", label: "Account History" },
]

export const UserAccountTabs = ({ user }: {
    user: Prisma.UserGetPayload<{
        include: {
            placementTests: {
                include: {
                    course: { include: { levels: true } },
                    student: { include: { courseStatus: { include: { level: true } } } },
                    tester: { include: { user: true } },
                    writtenTest: { include: { submissions: true } },
                }
            },
            certificates: { include: { course: true, courseLevel: true } },
            orders: true,
        }
    }>
}) => {
    const router = useRouter()
    const id = router.query?.id as string;

    return (
        <div>
            <Tabs id={id} defaultValue="notes" className="w-full">
                <TabsList className="w-full" >
                    {tabs.map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value="groups">
                    <Card>
                        <CardHeader>
                            <CardTitle>Groups</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center p-4">
                            <ZoomGroupsClient />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="placement_tests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Placement test</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <PlacmentTestScheduleClient
                                formattedData={user.placementTests.map(({
                                    id,
                                    student,
                                    course,
                                    oralTestTime,
                                    oralTestMeeting,
                                    tester,
                                    writtenTest,
                                    courseId,
                                    createdAt,
                                    updatedAt,
                                }) => {
                                    const test = writtenTest
                                    const Submission = writtenTest.submissions.find(sub => sub.studentId === student.id)
                                    const link = `${window.location.host}/placement_test/${course.slug}`

                                    return ({
                                        id,
                                        isLevelSubmitted: student.courseStatus.some(status => status.courseId === test.courseId && !!status.level),
                                        courseLevels: course.levels.map(level => ({
                                            label: level.name,
                                            value: level.id,
                                        })),
                                        courseId: courseId,
                                        studentUserId: student.id,
                                        studentName: student.name,
                                        studentEmail: student.email,
                                        studentImage: student.image,
                                        oralTestTime,
                                        oralTestMeeting,
                                        testLink: `/placement_test/${course.slug}`,
                                        testerId: tester.user.id,
                                        testerName: tester.user.name,
                                        testerEmail: tester.user.email,
                                        testerImage: tester.user.image,
                                        link,
                                        rating: Submission
                                            ? formatPercentage(Submission.totalScore / test.totalScore * 100)
                                            : "Not Submitted",
                                        createdAt,
                                        updatedAt,
                                    })
                                })}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="certificates">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cetificates</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center p-4 [&>*]:w-full">
                            <CertificatesClient formattedData={user.certificates.map(cert => ({
                                certificateId: cert.certificateId,
                                completionDate: cert.completionDate,
                                courseName: cert.course.name,
                                levelName: cert.courseLevel?.name || "",
                                id: cert.id,
                                createdAt: cert.createdAt,
                                updatedAt: cert.updatedAt,
                            }))} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history">
                    <AccountHistory user={user} />
                </TabsContent>
                <TabsContent value="notes">
                    <AccountNotes />
                </TabsContent>
            </Tabs>
        </div>
    )
}
