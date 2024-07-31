import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useEffect, useState } from "react";
import AccountHistory from "@/components/users/accountComponents/AccountHistory";
import AccountNotes from "@/components/users/accountComponents/AccountNotes";
import { useRouter } from "next/router";
import ZoomGroupsClient from "@/components/zoomGroupsComponents/Client";
import CoursesClient from "@/components/contentComponents/courses/CoursesClient";
import PlacmentTestScheduleClient from "@/components/contentComponents/placmentTestSchedule/PlacmentTestScheduleClient";
import { format } from "date-fns";
import { formatPercentage } from "@/lib/utils";
import { UserGetPayload } from "@/pages/account/[id]";
import CertificatesClient from "@/components/users/accountComponents/certificates/CertificateClient";

const tabs = [
    { value: "groups", label: "Groups" },
    { value: "waiting_list", label: "Waiting list" },
    { value: "placement_tests", label: "Placement tests" },
    { value: "certificates", label: "Certificates" },
    { value: "history", label: "Account History" },
    { value: "notes", label: "Account Notes" },
]

export const UserAccountTabs = ({ user }: { user: UserGetPayload }) => {
    const router = useRouter()
    const id = router.query?.id as string;
    const tabName = router.query.tab as string;

    const [tab, setTab] = useState("groups");

    useEffect(() => {
        if (!tabName && id) router.push(`${id}?tab=${tab}`)
        if (tabName) setTab(tabName)
    }, [tabName, id]);

    return (
        <div>
            <Tabs className="w-full" value={tab}>
                <TabsList className="w-full" >
                    {tabs.map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            onClick={() => router.push(`${id}?tab=${tab.value}`)}
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
                            <ZoomGroupsClient zoomGroupsData={user.zoomGroups} />
                        </CardContent>
                        <CardFooter className="flex items-center justify-end">
                            <Button type="button">Add to group</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="waiting_list">
                    <Card>
                        <CardHeader>
                            <CardTitle>Waiting List</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center p-4">
                            <CoursesClient formattedData={user.orders.flatMap(order => order.courses.filter(course => user.courseStatus.some(status => status.courseId === course.id && status.status === "waiting"))).map(course => ({
                                id: course.id,
                                name: course.name,
                                slug: course.slug,
                                image: course.image,
                                createdAt: course.createdAt,
                                updatedAt: course.updatedAt,
                                description: course.description,
                                groupPrice: course.groupPrice,
                                privatePrice: course.privatePrice,
                                instructorPrice: course.instructorPrice,
                                levels: course.levels,
                                orders: course.orders,
                            }))} />
                        </CardContent>
                        <CardFooter className="flex items-center justify-end">
                            <Button type="button">Add to group</Button>
                        </CardFooter>
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
                                    trainer,
                                    writtenTest,
                                    courseId,
                                    createdAt,
                                    updatedAt,
                                }) => {
                                    const test = writtenTest
                                    const Submission = writtenTest.submissions.find(sub => sub.userId === student.id)
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
                                        oralTestTiem: format(oralTestTime.testTime, "PPPp"),
                                        testLink: `/placement_test/${course.slug}`,
                                        trainerId: trainer.user.id,
                                        trainerName: trainer.user.name,
                                        trainerEmail: trainer.user.email,
                                        trainerImage: trainer.user.image,
                                        link,
                                        rating: Submission
                                            ? formatPercentage(Submission.rating / test.totalPoints * 100)
                                            : "Not Submitted",
                                        createdAt: format(createdAt, "Pp"),
                                        updatedAt: format(updatedAt, "Pp"),
                                    })
                                })}
                            />
                        </CardContent>
                        <CardFooter className="flex items-center justify-end">
                            <Button type="button">Add to group</Button>
                        </CardFooter>
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
                        <CardFooter className="flex items-center justify-end">
                            <Button type="button">Add to group</Button>
                        </CardFooter>
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
