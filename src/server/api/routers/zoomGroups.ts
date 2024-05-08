import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { SessionStatus } from "@prisma/client";
import { format } from "date-fns";
import { getInitials } from "@/lib/getInitials";

export const zoomGroupsRouter = createTRPCRouter({
    getzoomGroups: protectedProcedure
        .query(async ({ ctx }) => {
            const zoomGroups = await ctx.prisma.zoomGroup.findMany({
                include: {
                    course: true,
                    zoomSessions: true,
                    students: true,
                    trainer: {
                        include: { user: true }
                    },
                },
            });

            return { zoomGroups };
        }),
    getZoomGroupById: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ ctx, input: { id } }) => {
            const zoomGroup = await ctx.prisma.zoomGroup.findUnique({
                where: { id },
                include: {
                    course: true,
                    zoomSessions: true,
                    students: true,
                    trainer: true,
                },
            });
            return { zoomGroup };
        }),
    createZoomGroup: protectedProcedure
        .input(
            z.object({
                startDate: z.date(),
                studentIds: z.array(z.string()),
                trainerId: z.string(),
                courseId: z.string(),
            })
        )
        .mutation(async ({ input: { courseId, startDate, studentIds, trainerId }, ctx }) => {
            type ZoomSession = {
                sessionDate: Date,
                sessionLink: string,
                sessionStatus: SessionStatus,
                attenders: string[],
            }

            const generateZoomSessions = async (startDate: Date): Promise<ZoomSession[]> => {
                const sessions: ZoomSession[] = [];
                let currentDate = new Date(startDate);

                // Determine the start day
                const startDay = currentDate.getDay();

                // Define the pairs of days
                let days;
                if (startDay === 0 || startDay === 3) { // Sunday or Wednesday
                    days = [0, 3]; // Sunday and Wednesday
                } else if (startDay === 1 || startDay === 4) { // Monday or Thursday
                    days = [1, 4]; // Monday and Thursday
                } else { // Tuesday or Saturday
                    days = [2, 5]; // Tuesday and Saturday
                }

                //` Generate 7 sessions
                while (sessions.length < 8) {
                    if (days.some((day) => day === currentDate.getDay())) {
                        sessions.push({
                            attenders: [],
                            sessionStatus: "scheduled",
                            sessionDate: currentDate,
                            sessionLink: `https://zoom.us/start/webmeeting`,
                        })
                    }

                    currentDate.setDate(currentDate.getDate() + 1)
                }

                return sessions;
            }

            const trainer = await ctx.prisma.trainer.findUnique({ where: { id: trainerId }, include: { user: true } })
            const course = await ctx.prisma.course.findUnique({ where: { id: courseId } })

            const generateGroupNumnber = (): string => {
                return `${format(startDate.getTime(), "E-MMM-HH")}-${getInitials(trainer?.user.name)}-${course?.name}`
            }

            const zoomGroup = await ctx.prisma.zoomGroup.create({
                data: {
                    startDate,
                    groupNumber: generateGroupNumnber(),
                    groupStatus: "waiting",
                    zoomSessions: {
                        createMany: {
                            data: (await generateZoomSessions(startDate))
                        }
                    },
                    students: { connect: studentIds.map(c => ({ id: c })) },
                    trainer: { connect: { id: trainerId } },
                    course: { connect: { id: courseId } },
                },
                include: {
                    course: true,
                    zoomSessions: true,
                    students: true,
                    trainer: true,
                },
            });

            return {
                zoomGroup,
            };
        }),
    editZoomGroup: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                startDate: z.date(),
                studentIds: z.array(z.string()),
                trainerId: z.string(),
                courseId: z.string(),
            })
        )
        .mutation(
            async ({
                ctx,
                input: { id, courseId, startDate, studentIds, trainerId },
            }) => {
                const updatedZoomGroup = await ctx.prisma.zoomGroup.update({
                    where: {
                        id,
                    },
                    data: {
                        courseId: { set: courseId },
                        startDate: startDate,
                        studentIds: { set: studentIds },
                        trainerId: { set: trainerId }
                    },
                });

                return { updatedZoomGroup };
            }
        ),
    deleteZoomGroup: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
            const deletedzoomGroups = await ctx.prisma.zoomGroup.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedzoomGroups };
        }),
});
