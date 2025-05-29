import { preMeetingLinkConstructor } from "@/lib/meetingsHelpers";
import { sendGroupEndComms, sendNotification, sendPlacementTestStartingSoonComms, sendSessionEndComms, sendSessionStartComms, sendSessionStartingSoonComms } from "@/server/actions/emails";
import { Course, CourseLevel, MaterialItem, PrismaClient, SessionStatus, User, ZoomGroup, ZoomSession } from "@prisma/client";
import { env } from "process";
import { formatUserForComms } from "@/lib/fcmhelpers"
import { ROOT_EMAIL } from "@/server/constants";
import { format } from "date-fns";

export async function handleSessionStatusUpdate({ prisma, sessionStatus, students, course, level, material, updatedSession, zoomGroup, isZoom, isAllSessionsScheduled, currentUserId, isAllSessionsCompleted, nextSession }: {
    prisma: PrismaClient;
    currentUserId?: string;
    isZoom: boolean;
    isAllSessionsScheduled: boolean;
    isAllSessionsCompleted: boolean;
    sessionStatus: SessionStatus;
    students: User[];
    course: Course;
    level: CourseLevel;
    material: MaterialItem;
    updatedSession: ZoomSession;
    zoomGroup: ZoomGroup;
    nextSession?: ZoomSession;
}) {
    if (sessionStatus === "Starting") {
        await Promise.all(students.map(async st => {
            await sendSessionStartingSoonComms({
                courseName: course.name,
                quizLink: `${env.NEXTAUTH_URL}student/my_courses/${course.slug}/${level.slug}/quiz/${updatedSession.id}`,
                ...formatUserForComms(st),
                zoomJoinLink: preMeetingLinkConstructor({
                    isZoom,
                    meetingNumber: updatedSession.meetingNumber,
                    meetingPassword: updatedSession.meetingPassword,
                    sessionTitle: material.title,
                    sessionId: updatedSession.id,
                }),
                sessionDate: updatedSession.sessionDate,
            })
        }))
    }

    if (sessionStatus === "Ongoing" && isAllSessionsScheduled) {
        await prisma.zoomGroup.update({
            where: { id: zoomGroup.id },
            data: {
                groupStatus: "Active"
            }
        })
        await prisma.courseStatus.updateMany({
            where: {
                AND: {
                    userId: { in: zoomGroup.studentIds },
                    courseId: course.id,
                    courseLevelId: level.id,
                }
            },
            data: {
                status: "Ongoing"
            }
        })

        await Promise.all(students.map(async st => {
            await sendSessionStartComms({
                courseName: course.name,
                materialLink: `${env.NEXTAUTH_URL}student/my_courses/${course.slug}/${level.slug}/session/${updatedSession.id}`,
                sessionTitle: material.title,
                ...formatUserForComms(st),
                zoomJoinLink: preMeetingLinkConstructor({
                    isZoom,
                    meetingNumber: updatedSession.meetingNumber,
                    meetingPassword: updatedSession.meetingPassword,
                    sessionTitle: material.title,
                    sessionId: updatedSession.id,
                }),
                materialSlug: updatedSession.id,
                uploads: material.uploads
            })
        }))
    }

    if (sessionStatus === "Completed") {
        if (nextSession) {
            await Promise.all(students.map(async st => {
                await sendSessionEndComms({
                    courseName: course.name,
                    ...formatUserForComms(st),
                    assignmentLink: `${env.NEXTAUTH_URL}student/my_courses/${course.slug}/${level.slug}/assignment/${updatedSession.id}`,
                    nextSessionDate: nextSession?.sessionDate,
                    sessionTitle: material.title,
                })
            }))
        }
    }
    if (isAllSessionsCompleted) {
        await prisma.zoomGroup.update({
            where: { id: zoomGroup.id },
            data: {
                groupStatus: "Completed"
            }
        })
        await prisma.courseStatus.updateMany({
            where: {
                AND: {
                    userId: { in: zoomGroup.studentIds },
                    courseId: course.id,
                    courseLevelId: level.id,
                }
            },
            data: {
                status: "Completed"
            }
        })

        await Promise.all(students.map(async st => {
            await prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: `Student group Completed and final test unlocked`,
                    type: "Info",
                    messages: [{
                        message: `Group ${zoomGroup.groupNumber} Completed and the Student have been granted access to the final test.`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: currentUserId ? { id: currentUserId } : { email: ROOT_EMAIL } },
                    createdForStudent: { connect: { id: st.id } }
                }
            })

            await sendGroupEndComms({
                courseName: course.name,
                ...formatUserForComms(st),
                finalTestLink: `${env.NEXTAUTH_URL}student/my_courses/${course.slug}/${level.slug}/final_test`,
            })
        }))
    }
}

export async function handlePlacementTestProgress({ course, isZoom, sessionStatus, student, tester, updatedSession }: {
    sessionStatus: SessionStatus;
    course: Course;
    student: User;
    tester: User;
    updatedSession: ZoomSession;
    isZoom: boolean;
}) {
    if (sessionStatus === "Starting") {
        const zoomJoinLink = preMeetingLinkConstructor({
            isZoom,
            meetingNumber: updatedSession.meetingNumber,
            meetingPassword: updatedSession.meetingPassword,
            sessionTitle: `Placement Test - ${course.name}`,
            sessionId: updatedSession.id,
        })
        await sendPlacementTestStartingSoonComms({
            courseName: course.name,
            quizLink: `${env.NEXTAUTH_URL}student/placement_test/${course.slug}`,
            ...formatUserForComms(student),
            zoomJoinLink,
            sessionDate: updatedSession.sessionDate,
        })

        await sendNotification({ tokens: tester.fcmTokens, title: "📅 Test Starting Soon", body: `Your test for ${course.name} with student: ${student.name} is starting soon at ${format(updatedSession.sessionDate, "PPp")}!\nTake the quize now!`, link: zoomJoinLink })
    }
}