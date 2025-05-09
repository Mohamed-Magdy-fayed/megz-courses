import { seedMaterials } from "@/lib/seed/seeders/content/seedMaterials";
import { seedOrders } from "@/lib/seed/seeders/operations/seedOrders";
import { seedRootAdmin } from "@/lib/seed/seeders/seedRoot";
import { seedTrainers } from "@/lib/seed/seeders/users/seedTrainers";
import { connectDB } from "@/lib/seed/utils/connect";
import { generateGroupNumber, generateTimestamps, getRandomFutureSharpDate, mapCourseStatusToGroupStatus } from "@/lib/seed/utils/helpers";
import { logError, logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { faker } from "@faker-js/faker";
import { Document, ObjectId, OptionalId } from "mongodb";

type CourseStatus = Awaited<ReturnType<typeof seedOrders>>["courseStatuses"][number]

export const seedGroups = async (
    zoomAccount: Awaited<ReturnType<typeof seedRootAdmin>>["zoomAccount"],
    courseStatuses: CourseStatus[],
    teachers: Awaited<ReturnType<typeof seedTrainers>>["teachers"],
    materials: Awaited<ReturnType<typeof seedMaterials>>["materials"],
) => {
    logInfo("Seeding Zoom Groups...");

    const { db, client } = await connectDB();
    const zoomGroupCollection = db.collection("ZoomGroup");
    const zoomSessionCollection = db.collection("ZoomSession");

    const groupedStatuses = courseStatuses.reduce<{ private: CourseStatus[]; grouped: CourseStatus[] }>((groups, status) => {
        if (!status.courseLevelId) return groups
        if (status.isPrivate) {
            groups.private.push(status);
        } else {
            groups.grouped.push(status);
        }
        return groups;
    }, { private: [], grouped: [] });

    const groupsToInsert: { createdAt: Date; updatedAt: Date; _id: ObjectId; meetingNumber: string; meetingPassword: string; startDate: Date; groupNumber: string; groupStatus: string; teacherId: ObjectId; studentIds: any[]; courseId: any; courseLevelId: ObjectId | null | undefined; }[] = [];
    const zoomSessionsToInsert: { createdAt: Date; updatedAt: Date; _id: ObjectId; groupId: ObjectId; sessionStatus: string; sessionDate: Date; meetingNumber: string; meetingPassword: string; materialItemId: ObjectId; zoomClientId: ObjectId; attenders: any[] | any[] | undefined; }[] = [];

    // Ensure private groups are created for all private course statuses
    for (const status of groupedStatuses.private) {
        const timestamps = generateTimestamps();
        const teacher = faker.helpers.arrayElement(teachers);
        const groupId = new ObjectId()
        const startDate = getRandomFutureSharpDate(timestamps.createdAt);
        const groupNumber = generateGroupNumber(startDate, teacher.name);

        const group = {
            _id: groupId,
            meetingNumber: faker.string.numeric(10),
            meetingPassword: faker.internet.password({ length: 8 }),
            startDate,
            groupNumber,
            groupStatus: mapCourseStatusToGroupStatus(status.status),
            teacherId: teacher.teacherId,
            studentIds: [status.userId],
            courseId: status.courseId,
            courseLevelId: status.courseLevelId,
            ...timestamps
        };

        groupsToInsert.push(group);

        // Create zoom sessions for the group
        const materialItems = materials.filter(m => m.courseLevelId === status.courseLevelId);

        let currentDate = group.startDate;
        materialItems.forEach(material => {
            const sessionDate = new Date(currentDate)
            const now = new Date();
            const diffInMs = now.getTime() - sessionDate.getTime();

            const sessionStatus = sessionDate > now
                ? "Scheduled"
                : diffInMs <= 2 * 60 * 60 * 1000
                    ? "Ongoing"
                    : "Completed";

            zoomSessionsToInsert.push({
                _id: new ObjectId(),
                sessionStatus,
                sessionDate,
                meetingNumber: "77569231226",
                meetingPassword: "abcd1234",
                materialItemId: material._id,
                zoomClientId: zoomAccount._id,
                groupId,
                attenders: sessionStatus === "Completed" || sessionStatus === "Ongoing" ? [status.userId] : undefined,
                ...timestamps
            });

            currentDate.setDate(currentDate.getDate() + 2);
        })
    }

    // Step 1: Group by status + courseLevelId
    const groupedByStatusAndLevel: Record<string, CourseStatus[]> = {};

    for (const status of groupedStatuses.grouped) {
        if (!status.createdAt || !status.courseLevelId) continue;
        const key = `${status.status}_${status.courseLevelId.toString()}`;
        if (!groupedByStatusAndLevel[key]) groupedByStatusAndLevel[key] = [];
        groupedByStatusAndLevel[key].push(status);
    }

    // Step 2: Sort and batch students into Zoom groups
    for (const [key, statuses] of Object.entries(groupedByStatusAndLevel)) {
        statuses.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        while (statuses.length > 0) {
            const groupStatuses = statuses.splice(0, faker.number.int({ min: 6, max: 8 }));
            const timestamps = generateTimestamps();
            const teacher = faker.helpers.arrayElement(teachers);
            const groupId = new ObjectId()
            const startDate = faker.date.past({ years: 1 });
            const groupNumber = generateGroupNumber(startDate, teacher.name);

            const group = {
                _id: groupId,
                groupNumber,
                startDate,
                meetingNumber: "77569231226",
                meetingPassword: "abcd1234",
                groupStatus: mapCourseStatusToGroupStatus(groupStatuses[0]?.status || "Ongoing"),
                teacherId: teacher.teacherId,
                studentIds: groupStatuses.map(s => s.userId),
                courseId: groupStatuses[0]?.courseId,
                courseLevelId: groupStatuses[0]?.courseLevelId,
                ...timestamps
            };

            groupsToInsert.push(group);

            const materialItems = materials.filter(m => m.courseLevelId === groupStatuses[0]?.courseLevelId);

            let currentDate = group.startDate;
            materialItems.forEach(material => {
                const sessionDate = new Date(currentDate)
                const now = new Date();
                const diffInMs = now.getTime() - sessionDate.getTime();

                const sessionStatus = sessionDate > now
                    ? "Scheduled"
                    : diffInMs <= 2 * 60 * 60 * 1000
                        ? "Ongoing"
                        : "Completed";

                zoomSessionsToInsert.push({
                    _id: new ObjectId(),
                    sessionStatus,
                    sessionDate,
                    meetingNumber: "77569231226",
                    meetingPassword: "abcd1234",
                    materialItemId: material._id,
                    zoomClientId: zoomAccount._id,
                    groupId,
                    attenders: sessionStatus === "Completed" || sessionStatus === "Ongoing" ? groupStatuses.map(s => s.userId) : undefined,
                    ...timestamps
                });

                currentDate.setDate(currentDate.getDate() + 2);
            })
        }
    }

    const session = client.startSession();

    try {
        await session.withTransaction(async () => {
            await zoomGroupCollection.insertMany(groupsToInsert, { session });
            await zoomSessionCollection.insertMany(zoomSessionsToInsert, { session });
        });

        logSuccess(`Inserted ${groupsToInsert.length} Groups`);
        logSuccess(`Inserted ${zoomSessionsToInsert.length} Sessions`);

    } catch (error) {
        logError(`Error during seeding Orders: ${error}`);
    } finally {
        await session.endSession();
    }

    return {
        groups: groupsToInsert,
    };
};
